/**
 * @fileoverview About this file.
 *
 * User: kyawtun
 * Date: 21/10/12
 */

/**
 * Portion of this code is obtained from Facebook Inc's IndexedDB-polyfill
 * project under Apache License 2.0.
 */

goog.provide('ydn.db.utils');

/**
 * @const
 * @type {Object}
 */
ydn.db.utils.ARRAY_TERMINATOR = { };
/**
 * @const
 * @type {number}
 */
ydn.db.utils.BYTE_TERMINATOR = 0;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.TYPE_NUMBER = 1;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.TYPE_DATE = 2;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.TYPE_STRING = 3;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.TYPE_ARRAY = 4;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.MAX_TYPE_BYTE_SIZE = 12; // NOTE: Cannot be greater than 255


/**
 *
 * @param {*} key key to encode.
 * @return {string} encoded key as string.
 */
ydn.db.utils.encodeKey = function(key) {
  var stack = [key], writer = new ydn.db.utils.HexStringWriter(), type = 0,
    dataType, obj;
  while ((obj = stack.pop()) !== undefined) {
    if (type % 4 === 0 && type + ydn.db.utils.TYPE_ARRAY >
      ydn.db.utils.MAX_TYPE_BYTE_SIZE) {
      writer.write(type);
      type = 0;
    }
    dataType = typeof obj;
    if (obj instanceof Array) {
      type += ydn.db.utils.TYPE_ARRAY;
      if (obj.length > 0) {
        stack.push(ydn.db.utils.ARRAY_TERMINATOR);
        var i = obj.length;
        while (i--) stack.push(obj[i]);
        continue;
      }
      else {
        writer.write(type);
      }
    }
    else if (dataType === 'number') {
      type += ydn.db.utils.TYPE_NUMBER;
      writer.write(type);
      ydn.db.utils.encodeNumber(writer, obj);
    }
    else if (obj instanceof Date) {
      type += ydn.db.utils.TYPE_DATE;
      writer.write(type);
      ydn.db.utils.encodeNumber(writer, obj.valueOf());
    }
    else if (dataType === 'string') {
      type += ydn.db.utils.TYPE_STRING;
      writer.write(type);
      ydn.db.utils.encodeString(writer, obj);
    }
    else if (obj === ydn.db.utils.ARRAY_TERMINATOR) {
      writer.write(ydn.db.utils.BYTE_TERMINATOR);
    }
    else return ''; // null;
    type = 0;
  }
  return writer.trim().toString();
};


/**
 *
 * @param {string} encodedKey key to decoded.
 * @return {*} decoded key.
 */
ydn.db.utils.decodeKey = function(encodedKey) {
  var rootArray = []; // one-element root array that contains the result
  var parentArray = rootArray;
  var type, arrayStack = [], depth, tmp;
  var reader = new ydn.db.utils.HexStringReader(encodedKey);
  while (reader.read() != null) {
    if (reader.current === 0) // end of array
    {
      parentArray = arrayStack.pop();
      continue;
    }
    if (reader.current === null) {
      return rootArray[0];
    }
    do
    {
      depth = reader.current / 4 | 0;
      type = reader.current % 4;
      for (var i = 0; i < depth; i++) {
        tmp = [];
        parentArray.push(tmp);
        arrayStack.push(parentArray);
        parentArray = tmp;
      }
      if (type === 0 && reader.current + ydn.db.utils.TYPE_ARRAY >
        ydn.db.utils.MAX_TYPE_BYTE_SIZE) {
        reader.read();
      }
      else break;
    } while (true);

    if (type === ydn.db.utils.TYPE_NUMBER) {
      parentArray.push(ydn.db.utils.decodeNumber(reader));
    }
    else if (type === ydn.db.utils.TYPE_DATE) {
      parentArray.push(new Date(ydn.db.utils.decodeNumber(reader)));
    }
    else if (type === ydn.db.utils.TYPE_STRING) {
      parentArray.push(ydn.db.utils.decodeString(reader)); // add new
    }
    else if (type === 0) // empty array case
    {
      parentArray = arrayStack.pop();
    }
  }
  return rootArray[0];
};

// Utils
/**
 * @const
 * @type {number}
 */
ydn.db.utils.p16 = 0x10000;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.p32 = 0x100000000;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.p48 = 0x1000000000000;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.p52 = 0x10000000000000;
/**
 * @const
 * @type {number}
 */
ydn.db.utils.pNeg1074 = 5e-324;                      // 2^-1074);
/**
 * @const
 * @type {number}
 */
ydn.db.utils.pNeg1022 = 2.2250738585072014e-308;     // 2^-1022

/**
 *
 * @param {number} number
 * @return {Object} IEEE754 number.
 */
ydn.db.utils.ieee754 = function(number) {
  var s = 0, e = 0, m = 0;
  if (number !== 0) {
    if (isFinite(number)) {
      if (number < 0) {
        s = 1;
        number = -number;
      }
      var p = 0;
      if (number >= ydn.db.utils.pNeg1022) {
        var n = number;
        while (n < 1) {
          p--;
          n *= 2;
        }
        while (n >= 2) {
          p++;
          n /= 2;
        }
        e = p + 1023;
      }
      m = e ? Math.floor((number / Math.pow(2, p) - 1) * ydn.db.utils.p52) :
        Math.floor(number / ydn.db.utils.pNeg1074);
    }
    else {
      e = 0x7FF;
      if (isNaN(number)) {
        m = 2251799813685248; // QNan
      }
      else {
        if (number === -Infinity) s = 1;
      }
    }
  }
  return { sign: s, exponent: e, mantissa: m };
};


/**
 * @private
 * @param writer
 * @param number
 */
ydn.db.utils.encodeNumber = function(writer, number) {
  var iee_number = ydn.db.utils.ieee754(number);
  if (iee_number.sign) {
    iee_number.mantissa = ydn.db.utils.p52 - 1 - iee_number.mantissa;
    iee_number.exponent = 0x7FF - iee_number.exponent;
  }
  var word, m = iee_number.mantissa;

  writer.write((iee_number.sign ? 0 : 0x80) | (iee_number.exponent >> 4));
  writer.write((iee_number.exponent & 0xF) << 4 | (0 | m / ydn.db.utils.p48));

  m %= ydn.db.utils.p48;
  word = 0 | m / ydn.db.utils.p32;
  writer.write(word >> 8, word & 0xFF);

  m %= ydn.db.utils.p32;
  word = 0 | m / ydn.db.utils.p16;
  writer.write(word >> 8, word & 0xFF);

  word = m % ydn.db.utils.p16;
  writer.write(word >> 8, word & 0xFF);
};


/**
 * @private
 * @param reader
 * @return {*}
 */
ydn.db.utils.decodeNumber = function(reader) {
  var b = reader.read() | 0;
  var sign = b >> 7 ? false : true;

  var s = sign ? -1 : 1;

  var e = (b & 0x7F) << 4;
  b = reader.read() | 0;
  e += b >> 4;
  if (sign) e = 0x7FF - e;

  var tmp = [sign ? (0xF - (b & 0xF)) : b & 0xF];
  var i = 6;
  while (i--) tmp.push(sign ? (0xFF - (reader.read() | 0)) : reader.read() | 0);

  var m = 0;
  i = 7;
  while (i--) m = m / 256 + tmp[i];
  m /= 16;

  if (m === 0 && e === 0) return 0;
  return (m + 1) * Math.pow(2, e - 1023) * s;
};

/**
 * @const
 * @type {number}
 */
ydn.db.utils.secondLayer = 0x3FFF + 0x7F;

/**
 * @private
 * @param writer
 * @param string
 */
ydn.db.utils.encodeString = function(writer, string) {
  /* 3 layers:
   Chars 0         - 7E            are encoded as 0xxxxxxx with 1 added
   Chars 7F        - (3FFF+7F)     are encoded as 10xxxxxx xxxxxxxx with 7F
   subtracted
   Chars (3FFF+80) - FFFF          are encoded as 11xxxxxx xxxxxxxx xx000000
   */
  for (var i = 0; i < string.length; i++) {
    var code = string.charCodeAt(i);
    if (code <= 0x7E) {
      writer.write(code + 1);
    }
    else if (code <= ydn.db.utils.secondLayer) {
      code -= 0x7F;
      writer.write(0x80 | code >> 8, code & 0xFF);
    }
    else {
      writer.write(0xC0 | code >> 10, code >> 2 | 0xFF, (code | 3) << 6);
    }
  }
  writer.write(ydn.db.utils.BYTE_TERMINATOR);
};

/**
 * @private
 * @param reader
 * @return {string}
 */
ydn.db.utils.decodeString = function(reader) {
  var buffer = [], layer = 0, unicode = 0, count = 0, $byte, tmp;
  while (true) {
    $byte = reader.read();
    if ($byte === 0 || $byte == null) break;

    if (layer === 0) {
      tmp = $byte >> 6;
      if (tmp < 2 && !isNaN($byte)) { // kyaw: add !isNaN($byte)
        buffer.push(String.fromCharCode($byte - 1));
      }
      else // tmp equals 2 or 3
      {
        layer = tmp;
        unicode = $byte << 10;
        count++;
      }
    }
    else if (layer === 2) {
      buffer.push(String.fromCharCode(unicode + $byte + 0x7F));
      layer = unicode = count = 0;
    }
    else // layer === 3
    {
      if (count === 2) {
        unicode += $byte << 2;
        count++;
      }
      else // count === 3
      {
        buffer.push(String.fromCharCode(unicode | $byte >> 6));
        layer = unicode = count = 0;
      }
    }
  }
  return buffer.join('');
};

/**
 * @private
 * @param string
 * @constructor
 */
ydn.db.utils.HexStringReader = function(string) {
  this.current = null;

  //var string = string;
  var lastIndex = string.length - 1;
  var index = -1;

  this.read = function() {
    return this.current = index < lastIndex ? parseInt(string[++index] +
      string[++index], 16) : null;
  };
};

/**
 * @private
 * @constructor
 */
ydn.db.utils.HexStringWriter = function() {
  var buffer = [], c;
  this.write = function($byte) {
    for (var i = 0; i < arguments.length; i++) {
      c = arguments[i].toString(16);
      buffer.push(c.length === 2 ? c : c = '0' + c);
    }
  };
  this.toString = function() {
    return buffer.length ? buffer.join('') : null;
  };
  this.trim = function() {
    var length = buffer.length;
    while (buffer[--length] === '00') {}
    buffer.length = ++length;
    return this;
  };
};
