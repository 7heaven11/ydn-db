
goog.require('goog.debug.Console');
goog.require('goog.testing.jsunit');
goog.require('ydn.async');
goog.require('ydn.db.core.Storage');
goog.require('ydn.db.schema.DataType');
goog.require('ydn.db');
goog.require('ydn.testing');


var reachedFinalContinuation, debug_console, basic_schema;
var db_name = 'test_key_11_4';
var string_table = 't1';
var number_table = 't2';
var date_table = 't3';
var array_table = 't4';
var out_of_line_store = 't5';

var db_name_to_delete;


var setUp = function() {
  if (!debug_console) {
    debug_console = new goog.debug.Console();
    debug_console.setCapturing(true);
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.WARNING);
  //goog.debug.Logger.getLogger('ydn.gdata.MockServer').setLevel(goog.debug.Logger.Level.FINEST);
    //goog.debug.Logger.getLogger('ydn.db').setLevel(goog.debug.Logger.Level.FINE);
  //goog.debug.Logger.getLogger('ydn.db.con').setLevel(goog.debug.Logger.Level.FINEST);
  //goog.debug.Logger.getLogger('ydn.db.req').setLevel(goog.debug.Logger.Level.FINEST);
  //ydn.db.con.IndexedDb.DEBUG = true;
  //ydn.db.con.WebSql.DEBUG = true;
  //ydn.db.core.req.IndexedDb.DEBUG = true;
  //ydn.db.core.req.WebSql.DEBUG = true;
  }


  db_name_to_delete = null;
  reachedFinalContinuation = false;
};

var tearDown = function() {
  if (goog.isString(db_name_to_delete)) {
    ydn.db.deleteDatabase(db_name_to_delete);
  }
  assertTrue('The final continuation was not reached', reachedFinalContinuation);
};

var getBasicSchema = function () {
  var s1 = new ydn.db.schema.Store(string_table, 'id');
  var s2 = new ydn.db.schema.Store(number_table, 'id', false,
      ydn.db.schema.DataType.NUMERIC);
  var s3 = new ydn.db.schema.Store(date_table, 'id', false,
      ydn.db.schema.DataType.DATE);
  var s4 = new ydn.db.schema.Store(array_table, 'id', false,
      ydn.db.schema.DataType.ARRAY);
  var s5 = new ydn.db.schema.Store(out_of_line_store, undefined,  false);
  basic_schema = new ydn.db.schema.Database(1, [s1, s2, s3, s4, s5]);
  return basic_schema;
};

var createDb = function() {

  var basic_schema = getBasicSchema();

  var db = new ydn.db.core.Storage(db_name, basic_schema, options);
  return db;
};


var key_test = function(db, key, table_name, callback) {

  table_name = table_name || string_table;
  //console.log('testing ' + key + ' on ' + table_name);
  var key_value = 'a' + Math.random();

  var a_done;
  var a_value;
  waitForCondition(
      // Condition
      function() { return a_done; },
      // Continuation
      function() {
        assertEquals('put a', key, a_value);
      },
      100, // interval
      5000); // maxTimeout

  db.put(table_name, {id: key, value: key_value}).addCallback(function(value) {
    //console.log(db + ' receiving put value callback for ' + key + ' = ' + key_value);
    a_value = value;
    a_done = true;
  });

  var b_done;
  var b_value;
  waitForCondition(
      // Condition
      function() { return b_done; },
      // Continuation
      function() {
        assertEquals('get', key_value, b_value.value);
        if (callback) {
          callback(true);
        }
      },
      100, // interval
      5000); // maxTimeout

  db.get(table_name, key).addCallback(function(value) {
    console.log(db + ' receiving get value callback ' + key + ' = ' + JSON.stringify(value));
    b_value = value;
    b_done = true;
  });
};


var test_01_encode_key = function () {

  var test_key = function (key, type) {
    var encoded = ydn.db.schema.Index.js2sql(key, type);
    var decoded = ydn.db.schema.Index.sql2js(encoded, type);
    if (goog.isArray(key)) {
      assertArrayEquals(type + ':' + JSON.stringify(key), key, decoded);
    } else {
      assertEquals(type + ':' + JSON.stringify(key), key, decoded);
    }

  };

  test_key(0, ydn.db.schema.DataType.NUMERIC);
  test_key(1, ydn.db.schema.DataType.NUMERIC);
  test_key(0);
  test_key(1);
  test_key('abc', ydn.db.schema.DataType.TEXT);
  test_key('abc');
  test_key(['a', 'b'], ['TEXT', 'TEXT']);
  test_key(['a', 'b']);

  reachedFinalContinuation = true;
};

var _test_02_encode_blob = function () {

  var test_key = function (key, type) {
    var encoded = ydn.db.schema.Index.js2sql(key, type);
    var decoded = ydn.db.schema.Index.sql2js(encoded, type);
    if (goog.isArray(key)) {
      assertArrayEquals(type + ':' + JSON.stringify(key), key, decoded);
    } else {
      //console.log(key);
      //console.log(decoded);
      assertEquals(type + ':' + JSON.stringify(key), key, decoded);
    }

  };

  var done;

  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {

      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout

  var url = 'http://upload.wikimedia.org/wikipedia/commons/6/6e/HTML5-logo.svg';
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.addEventListener("load", function () {
    if (xhr.status === 200) {
      console.log("Image retrieved");
      var blob = xhr.response;
      test_key(blob, ydn.db.schema.DataType.BLOB);
      done = true;
    }
  }, false);
  xhr.send();


};


/**
 */
var test_11_string_keys = function() {

  var db = createDb();

  var on_completed = function() {
    reachedFinalContinuation = true;
  };

  key_test(db, 'x');
  //key_test(new Date());  // Date is allow key
  key_test(db, 't@som.com');
  key_test(db, 'http://www.ok.com');
  key_test(db, 'http://www.ok.com/?id=123#ok');
  key_test(db, 'ID: /*!32302 10*/');
  key_test(db, 'x;" DROP TABLE ' + string_table, string_table, on_completed);

};

var test_12_number_keys = function() {

  var db_name = 'test_key_12_3';
  var basic_schema = getBasicSchema();
  var db = new ydn.db.core.Storage(db_name, basic_schema, options);

  var on_completed = function() {
    reachedFinalContinuation = true;
  };

  key_test(db, 1, number_table);
  key_test(db, 0, number_table);
  key_test(db, -1, number_table);
  key_test(db, Math.random(), number_table);
  key_test(db, -Math.random(), number_table);
  key_test(db, 1.0, number_table, on_completed);

};


var test_13_array_key = function () {
  var store_name = 'st';
  var db_name = 'test_13_2';
  var store_schema = new ydn.db.schema.Store(store_name, 'id', false, ydn.db.schema.DataType.Array);
  var schema = new ydn.db.schema.Database(undefined, [store_schema]);
  var db = new ydn.db.core.Storage(db_name, schema, options);

  var objs = [
    {id:['a', 'qs0'], value:0, type:'a'},
    {id:['a', 'qs1'], value:1, type:'a'},
  ];

  db.put(store_name, objs).addCallback(function (value) {
    console.log(db_name + ' ready');
  });

  var done, result;

  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {
      assertArrayEquals('result', objs, result);

      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout


  db.list(store_name).addBoth(function (value) {
    console.log('fetch value: ' + JSON.stringify(value));
    result = value;
    done = true;
  });

};



var test_21_out_of_line = function () {

  var db = createDb();
  var key = Math.random();
  var data = {test: 'some random ' + Math.random(), type: Math.random()};

  var done, result, put_done, put_result;

  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {
      assertEquals('value', data.test, result.test);

      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout

  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertEquals('key', key, put_result);
      // retrieve back by those key

      db.get(out_of_line_store, put_result).addBoth(function (value) {
        console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;
      });
    },

    100, // interval
    5000); // maxTimeout

  db.put(out_of_line_store, data, key).addCallback(function (value) {
    //console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};


var test_22_out_of_line_array = function () {
  var store_name = 'demoOS';
  var db_name = 'test_22_2';
  var store_schema = new ydn.db.schema.Store(store_name, undefined,  false);
  var schema = new ydn.db.schema.Database(1, [store_schema]);
  var db = new ydn.db.core.Storage(db_name, schema, options);

  var objs = [
    {id:'qs0', value:0, type:'a'},
    {id:'qs1', value:1, type:'a'},
    {id:'at2', value:2, type:'b'},
    {id:'bs1', value:3, type:'b'},
    {id:'bs2', value:4, type:'c'},
    {id:'bs3', value:5, type:'c'},
    {id:'st3', value:6, type:'c'}
  ];
  var keys = objs.map(function(x) {return x.id});

  var done, result, put_done, put_result;

  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {
      assertEquals('length', objs.length, result.length);
      assertArrayEquals('get back', objs, result);

      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout

  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertEquals('key length', objs.length, put_result.length);
      assertArrayEquals('get back the keys', keys, put_result);
      // retrieve back by those key

      db.list(store_name, put_result).addBoth(function (value) {
        //console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;
      });
    },

    100, // interval
    5000); // maxTimeout

  db.put(store_name, objs, keys).addCallback(function (value) {
    //console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};


var test_40_nested_keyPath = function() {
  var store_name = 'ts1';
  var db_name = 'test_key_40_4';
  var store = new ydn.db.schema.Store(store_name, 'id.$t', false, ydn.db.schema.DataType.TEXT);
  var schema = new ydn.db.schema.Database(1, [store]);

  var db = new ydn.db.core.Storage(db_name, schema, options);

  var key = 'a';
  var put_done = false;
  var put_value = {value: Math.random()};
  put_value.id = {$t: key};
  var put_value_received;

  waitForCondition(
    // Condition
    function() { return put_done; },
    // Continuation
    function() {
      assertEquals('put a 1', key, put_value_received);
      // Remember, the state of this boolean will be tested in tearDown().
    },
    100, // interval
    5000); // maxTimeout

  db.put(store_name, put_value).addCallback(function(value) {
    console.log('put: ' + value);
    put_value_received = value;
    put_done = true;
  });

  var get_done;
  var get_value_received;
  waitForCondition(
    // Condition
    function() { return get_done; },
    // Continuation
    function() {
      assertObjectEquals('get', put_value, get_value_received);
      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout


  db.get(store_name, key).addCallback(function(value) {
    console.log('receiving get value callback ' + key + ' = ' + JSON.stringify(value) + ' ' + typeof value);
    get_value_received = value;
    get_done = true;
  });

};


var test_42_autoincreasement_offline = function () {
  var store_name = 'demoOS';
  var db_name = 'test_42_26';
  var store_schema = new ydn.db.schema.Store(store_name, undefined, true);
  var schema = new ydn.db.schema.Database(1, [store_schema]);
  var db = new ydn.db.core.Storage(db_name, schema, options);

  var objs = [
    {id:'qs0', value:0, type:'a'},
    {id:'qs1', value:1, type:'a'},
    {id:'at2', value:2, type:'b'},
    {id:'bs1', value:3, type:'b'},
    {id:'bs2', value:4, type:'c'},
    {id:'bs3', value:5, type:'c'},
    {id:'st3', value:6, type:'c'}
  ];


  var done, result, put_done, put_result;

  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {
      assertEquals('length', objs.length, result.length);
      assertArrayEquals('get back', objs, result);

      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout

  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertEquals('key length', objs.length, put_result.length);
      for (var i = 1; i < objs.length; i++) {
        assertEquals('auto increase at ' + i, put_result[i], put_result[i-1] + 1);
      }

      // retrieve back by those key

      db.list(store_name, put_result).addBoth(function (value) {
        //console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;
      });
    },

    100, // interval
    5000); // maxTimeout

  db.put(store_name, objs).addCallback(function (value) {
    //console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};


var test_43_autoincreasement_inline = function () {
  var store_name = 'demoOS';
  var db_name = 'test_key_43_5';
  var store_schema = new ydn.db.schema.Store(store_name, 'value', true,
      ydn.db.schema.DataType.INTEGER);
  var schema = new ydn.db.schema.Database(1, [store_schema]);
  var db = new ydn.db.core.Storage(db_name, schema, options);

  var objs = [
    {id:'qs0', value:0, type:'a'},
    {id:'bs1', type:'b'},
    {id:'bs2', value:4, type:'c'},
    {id:'st3', type:'c'}
  ];

  var done, result, put_done, keys;

  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {
      assertEquals('length', objs.length, result.length);
      for (var i = 0; i < objs.length; i++) {
        assertEquals('obj ' + i, objs[i].id, result[i].id);
      }

      reachedFinalContinuation = true;
    },
    100, // interval
    5000); // maxTimeout

  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertEquals('key length', objs.length, keys.length);
      for (var i = 0; i < keys.length; i++) {
        assertNotNullNorUndefined('at ' + i, keys[i]);
        if (goog.isDef(objs[i].value)) {
          assertEquals('at ' + i, objs[i].value, keys[i]);
        }
      }

      // retrieve back by those key

      db.list(store_name, keys).addBoth(function (value) {
        console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;
      });
    },

    100, // interval
    5000); // maxTimeout


  // last two are given different value
  db.put(store_name, objs).addCallback(function (value) {
    console.log(['receiving key from put', value]);
    keys = value;
    put_done = true;
  }).addErrback(function(e) {
        console.error(e);
        keys = [];
        put_done = true;
      });
};




var test_51_autoschema_out_of_line_key = function () {

  var db_name = 'test_51_no_type_key_1';
  var db = new ydn.db.core.Storage(db_name);
  var key = Math.random();
  var data = {test: 'some random ' + Math.random(), type: Math.random()};

  var done, result, put_done, put_result;

  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertEquals('key', key, put_result);
      // retrieve back by those key

      waitForCondition(
        // Condition
        function () {
          return done;
        },
        // Continuation
        function () {
          assertEquals('value', data.test, result.test);

          reachedFinalContinuation = true;
          db_name_to_delete = db_name;
        },
        100, // interval
        5000); // maxTimeout

      db.get(out_of_line_store, key).addBoth(function (value) {
        console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;

      });
    },

    100, // interval
    5000); // maxTimeout

  db.put(out_of_line_store, data, key).addCallback(function (value) {
    //console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};


var test_52_autoschema_in_line_key = function () {

  var db_name = 'test_52_autoschema_in_line_key_1';
  var db = new ydn.db.core.Storage(db_name);
  var key = Math.random();
  var store = {name: 'st', keyPath: 'id'};
  var data = {id: key, test: 'some random ' + Math.random(), type: Math.random()};

  var done, result, put_done, put_result;

  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertEquals('key', key, put_result);
      // retrieve back by those key

      waitForCondition(
        // Condition
        function () {
          return done;
        },
        // Continuation
        function () {
          assertEquals('value', data.test, result.test);

          reachedFinalContinuation = true;
          db_name_to_delete = db_name;
        },
        100, // interval
        5000); // maxTimeout

      db.get('st', key).addBoth(function (value) {
        console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;

      });
    },

    100, // interval
    5000); // maxTimeout

  db.put(store, data).addCallback(function (value) {
    //console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};


var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);



