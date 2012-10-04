
goog.require('goog.debug.Console');
goog.require('goog.testing.jsunit');
goog.require('ydn.db.Storage');
goog.require('ydn.testing');


var reachedFinalContinuation;
var table_name = 't1';
var basic_schema;

var setUp = function() {
  var c = new goog.debug.Console();
  c.setCapturing(true);
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.FINE);
  //goog.debug.Logger.getLogger('ydn.gdata.MockServer').setLevel(goog.debug.Logger.Level.FINEST);
  goog.debug.Logger.getLogger('ydn.db').setLevel(goog.debug.Logger.Level.FINE);
  //ydn.db.con.WebSql.DEBUG = true;
  //ydn.db.req.WebSql.DEBUG = true;

  basic_schema = new ydn.db.DatabaseSchema(1);
  basic_schema.addStore(new ydn.db.StoreSchema(table_name, 'id'));

};

var tearDown = function() {
  assertTrue('The final continuation was not reached', reachedFinalContinuation);

};

var db_name = 'test2';
var options = {preference: ['websql']};

var test_0_put = function() {

  var db = new ydn.db.Storage(db_name, basic_schema, options);

  var put_value, done;

  waitForCondition(
      // Condition
      function() { return done; },
      // Continuation
      function() {
        assertEquals('put a 1', 'a', put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      1000); // maxTimeout

  db.put(table_name, {'id': 'a', 'value': '1'}).addCallback(function(value) {
    put_value = value;
    done = true;
  });

};


var test_11_put_arr = function() {
  var db_name = 'test_3';
  var db = new ydn.db.Storage(db_name, basic_schema, options);

  var arr = [
    {id: 'a' + Math.random(),
      value: 'a' + Math.random(), remark: 'put test'},
    {id: 'b' + Math.random(),
      value: 'b' + Math.random(), remark: 'put test'},
    {id: 'c' + Math.random(),
      value: 'c' + Math.random(), remark: 'put test'}
  ];

  var hasEventFired = false;
  var put_value;

  waitForCondition(
    // Condition
    function() { return hasEventFired; },
    // Continuation
    function() {
      assertArrayEquals('put a', [arr[0].id, arr[1].id, arr[2].id], put_value);
      // Remember, the state of this boolean will be tested in tearDown().
      reachedFinalContinuation = true;
    },
    100, // interval
    2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value = value;
    hasEventFired = true;
  });
};

var test_1_get_all = function() {

  var db_name = 'get_empty_table_test_21';
  var db = new ydn.db.Storage(db_name, basic_schema, options);

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertArrayEquals('get empty table', [], put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout

  db.get(table_name).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value = value;
    hasEventFired = true;
  });
};


var test_1_delete = function() {

  console.log('starting')
  var db = new ydn.db.Storage(db_name, basic_schema, options);
  console.log(db.getSchema());

	var put_value, done;

	waitForCondition(
		// Condition
		function() { return done; },
		// Continuation
		function() {
			assertTrue('deleted', put_value);
			// Remember, the state of this boolean will be tested in tearDown().
			reachedFinalContinuation = true;
		},
		100, // interval
		1000); // maxTimeout

	db.clear(table_name).addCallback(function(value) {
		put_value = value;
		done = true;
	});

};


var test_2_clear_table = function() {

  var db = new ydn.db.Storage(db_name, basic_schema, options);

  var cleared_value, cleared;

  waitForCondition(
      // Condition
      function() { return cleared; },
      // Continuation
      function() {
        assertTrue('cleared', cleared_value);
        reachedFinalContinuation = true;
      },
      100, // interval
      1000); // maxTimeout


  db.clear(table_name).addCallback(function(value) {
    cleared_value = value;
    cleared = true;
  }).addErrback(function(v) {
    fail('should not get error.');
  });
};


var test_2_clear = function() {

  var db = new ydn.db.Storage(db_name, basic_schema, options);

  db.put(table_name, {'id': 'a', 'value': '1'});

  var cleared_value, cleared;

  waitForCondition(
      // Condition
      function() { return cleared; },
      // Continuation
      function() {
        assertTrue('cleared', cleared_value);
        reachedFinalContinuation = true;
      },
      100, // interval
      1000); // maxTimeout


  db.clear(table_name, 'a').addCallback(function(value) {
    cleared_value = value;
    cleared = true;
  }).addErrback(function(v) {
        fail('should not get error.');
      });
};


var test_22_get_arr = function() {
  var db_name = 'test_22';
  var db = new ydn.db.Storage(db_name, basic_schema, options);
  assertEquals('db', 'websql', db.type());

  var arr = [];
  var n = ydn.db.req.WebSql.REQ_PER_TX / 2;
  for (var i = 0; i < n; i++) {
    arr.push({id: i, value: 'a' + Math.random()});
  }
  var ids = [1, 2];


  var hasEventFired = false;
  var results;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertEquals('length', ids.length, results.length);
        assertEquals('1', arr[ids[0]].value, results[0].value);
        assertEquals('1', arr[ids[1]].value, results[1].value);

        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr);

  db.get(table_name, ids).addCallback(function(value) {
    console.log('receiving value callback.');
    results = value;
    hasEventFired = true;
  }).addErrback(function(e) {
        hasEventFired = true;
        console.log('Error: ' + e);
      });
};



var test_23_get_arr = function() {
  var db_name = 'test_23';
  var db = new ydn.db.Storage(db_name, basic_schema, options);
  assertEquals('db', 'websql', db.type());

  var arr = [];
  var n = ydn.db.req.WebSql.REQ_PER_TX * 2.5;
  for (var i = 0; i < n; i++) {
    arr.push({id: i, value: 'a' + Math.random()});
  }
  var ids = [2,
    ydn.db.req.WebSql.REQ_PER_TX,
    ydn.db.req.WebSql.REQ_PER_TX+1,
    2*ydn.db.req.WebSql.REQ_PER_TX+1];


  var hasEventFired = false;
  var results;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertEquals('length', ids.length, results.length);
        assertEquals('1', arr[ids[0]].value, results[0].value);
        assertEquals('1', arr[ids[1]].value, results[1].value);
        assertEquals('1', arr[ids[2]].value, results[2].value);
        assertEquals('1', arr[ids[3]].value, results[3].value);

        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr);

  db.get(table_name, ids).addCallback(function(value) {
    console.log('receiving value callback.');
    results = value;
    hasEventFired = true;
  }).addErrback(function(e) {
        hasEventFired = true;
        console.log('Error: ' + e);
      });
};



var test_82_fetch_keys = function () {
  var store_name = 'st';
  var db_name = 'test821';
  var indexSchema = new ydn.db.IndexSchema('id', undefined, true);
  var store_schema = new ydn.db.StoreSchema(store_name, 'id', false, undefined, [indexSchema]);
  var schema = new ydn.db.DatabaseSchema(1,  [store_schema]);
  var db = new ydn.db.Storage(db_name, schema, options);
  assertEquals('db', 'websql', db.type());

  var objs = [];
  var n = ydn.db.req.IndexedDb.REQ_PER_TX * 2.5;
  for (var i = 0; i < n; i++) {
    objs.push({id: 'a' + i, value: Math.random()});
  }
  var ids = [2,
    ydn.db.req.IndexedDb.REQ_PER_TX,
    ydn.db.req.IndexedDb.REQ_PER_TX+1,
    2*ydn.db.req.IndexedDb.REQ_PER_TX+1];
  var keys = [];
  for (var i = 0; i < ids.length; i++) {
    keys.push(new ydn.db.Key(store_name, objs[ids[i]].id));
  }

  var put_done;

  waitForCondition(
      // Condition
      function () {
        return put_done;
      },
      // Continuation
      function () {

        var get_done, results;
        waitForCondition(
            // Condition
            function () {
              return get_done;
            },
            // Continuation
            function () {
              assertEquals('length', keys.length, results.length);
              for (var i = 0; i < keys.length; i++) {
                assertEquals('1', objs[ids[i]].value, results[i].value);
              }

              reachedFinalContinuation = true;
            },
            100, // interval
            2000); // maxTimeout

        db.get(keys).addCallback(function (value) {
          console.log('fetch value: ' + JSON.stringify(value));
          results = value;
          get_done = true;
        });

      },
      100, // interval
      2000); // maxTimeout

  db.put(store_name, objs).addCallback(function (value) {
    console.log(['receiving value callback.', value]);
    put_done = true;
  });
};


var test_42_autoincreasement = function () {
  var store_name = 'demoOS';
  var db_name = 'test_42_24';
  var store_schema = new ydn.db.StoreSchema(store_name, undefined, true);
  var schema = new ydn.db.DatabaseSchema(1,  [store_schema]);
  var db = new ydn.db.Storage(db_name, schema, options);

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
    1000); // maxTimeout

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

      db.get(store_name, put_result).addBoth(function (value) {
        console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;
      });
    },

    100, // interval
    1000); // maxTimeout

  db.put(store_name, objs).addBoth(function (value) {
    console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};


var test_43_no_key_column = function () {
  var store_name = 'demoOS';
  var db_name = 'test_43_27';
  var store_schema = new ydn.db.StoreSchema(store_name, undefined, false);
  var schema = new ydn.db.DatabaseSchema(1,  [store_schema]);
  var db = new ydn.db.Storage(db_name, schema, options);

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
    1000); // maxTimeout

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

      db.get(store_name, put_result).addBoth(function (value) {
        console.log('fetch value: ' + JSON.stringify(value));
        result = value;
        done = true;
      });
    },

    100, // interval
    1000); // maxTimeout

  db.put(store_name, objs, keys).addCallback(function (value) {
    console.log(['receiving key from put', value]);
    put_done = true;
    put_result = value
  });
};

var test_83_fetch_keys = function () {
  var store_name1 = 'st1';
  var store_name2 = 'st2';
  var db_name = 'test83';
  var indexSchema = new ydn.db.IndexSchema('id', undefined, true);
  var store_schema1 = new ydn.db.StoreSchema(store_name1, 'id', false, undefined, [indexSchema]);
  var store_schema2 = new ydn.db.StoreSchema(store_name2, 'id');
  var schema = new ydn.db.DatabaseSchema(1,  [store_schema1, store_schema2]);
  var db = new ydn.db.Storage(db_name, schema, options);
  assertEquals('db', 'websql', db.type());


  var objs1 = [];
  var n = ydn.db.req.WebSql.REQ_PER_TX * 2.5;
  for (var i = 0; i < n; i++) {
    objs1.push({id: 'a' + i, value: Math.random()});
  }

  var objs2 = [];
  for (var i = 0; i < n; i++) {
    objs2.push({id: 'b' + i, value: Math.random()});
  }
  var ids = [2,
    ydn.db.req.WebSql.REQ_PER_TX,
    ydn.db.req.WebSql.REQ_PER_TX+1,
    2*ydn.db.req.WebSql.REQ_PER_TX+1];
  var keys = [];
  for (var i = 0; i < ids.length; i++) {
    keys.push(new ydn.db.Key(store_name1, objs1[ids[i]].id));
  }
  for (var i = 0; i < ids.length; i++) {
    keys.push(new ydn.db.Key(store_name2, objs2[ids[i]].id));
  }

  var put1_done, put2_done;

  waitForCondition(
      // Condition
      function () {
        return put1_done && put2_done;
      },
      // Continuation
      function () {

        var get_done, results;
        waitForCondition(
            // Condition
            function () {
              return get_done;
            },
            // Continuation
            function () {
              assertEquals('length', ids.length * 2, results.length);
              for (var i = 0; i < ids.length; i++) {
                assertEquals('store 1 ' + i, objs1[ids[i]].value, results[i].value);
              }
              for (var i = 0; i < ids.length; i++) {
                assertEquals('store 2 ' + i, objs2[ids[i]].value, results[i+ids.length].value);
              }

              reachedFinalContinuation = true;
            },
            100, // interval
            2000); // maxTimeout


        db.get(keys).addCallback(function (value) {
          console.log('fetch value: ' + JSON.stringify(value));
          results = value;
          get_done = true;
        });

      },
      100, // interval
      2000); // maxTimeout

  db.put(store_name1, objs1).addCallback(function (value) {
    console.log(['receiving value callback.', value]);
    put1_done = true;
  });
  db.put(store_name2, objs2).addCallback(function (value) {
    console.log(['receiving value callback.', value]);
    put2_done = true;
  });

};

//
///**
//*/
//var test_special_keys = function() {
//  var db = new ydn.db.WebSql(db_name, basic_schema);
//
//
//  var test_key = function(key) {
//    console.log('testing ' + key);
//    var key_value = 'a' + Math.random();
//
//    var a_done;
//    var a_value;
//    waitForCondition(
//        // Condition
//        function() {
//          return a_done;
//        },
//        // Continuation
//        function() {
//          assertEquals('put', key, a_value);
//
//          var b_done;
//          var b_value;
//          waitForCondition(
//              // Condition
//              function() {
//                return b_done;
//              },
//              // Continuation
//              function() {
//                assertEquals('get', key_value, b_value);
//                reachedFinalContinuation = true;
//              },
//              100, // interval
//              2000); // maxTimeout
//
//
//          db.getItem(key).addCallback(function(value) {
//            console.log('receiving get value callback ' + key + ' = ' + value);
//            b_value = value;
//            b_done = true;
//          });
//
//        },
//        100, // interval
//        2000); // maxTimeout
//
//    db.put(key, key_value).addCallback(function(value) {
//      console.log('receiving put value callback for ' + key + ' = ' + key_value + ' ' + value);
//      a_value = value;
//      a_done = true;
//    });
//
//  };
//
//  test_key('x');
//
//  test_key('t@som.com');
//
//  test_key('http://www.ok.com');
//
//  test_key('http://www.ok.com/.htere#somer?par=so');
//
//};
//
//
///**
// */
//var test_special_value = function() {
//  var db = new ydn.db.WebSql(db_name, {});
//
//  var ik = 0;
//
//  var test_value = function(value) {
//    var key = 'a' + ik++;
//    console.log('testing ' + value);
//
//    var a_done;
//    var a_value;
//    waitForCondition(
//        // Condition
//        function() {
//          return a_done;
//        },
//        // Continuation
//        function() {
//          assertTrue('put', a_value);
//
//          var b_done;
//          var b_value;
//          waitForCondition(
//              // Condition
//              function() {
//                return b_done;
//              },
//              // Continuation
//              function() {
//                assertEquals('get', value, b_value);
//                reachedFinalContinuation = true;
//              },
//              100, // interval
//              2000); // maxTimeout
//
//          db.getItem(key).addCallback(function(value) {
//            console.log('receiving get value callback ' + key + ' = ' + value);
//            b_value = value;
//            b_done = true;
//          });
//
//        },
//        100, // interval
//        2000); // maxTimeout
//
//    db.setItem(key, value).addCallback(function(value) {
//      console.log('receiving put value callback for ' + key + ' = ' + value + ' ' + value);
//      a_value = value;
//      a_done = true;
//    });
//
//  };
//
//  test_value('a string');
//
//  test_value(ydn.json.stringify({id: 'a', value: 10.2}));
//
//  test_value(ydn.json.stringify({value: Math.random(), 'name': ydn.testing.randEmail()}));
//
//};
//
//

var test_5_get = function() {
  var store_name = 'ydn.test.ts1';
  var db_name = 'ydn.putodbtest21';
  var schema = new ydn.db.DatabaseSchema(1);
	schema.addStore(new ydn.db.StoreSchema(store_name, 'id'));

  var db = new ydn.db.Storage(db_name, schema, options);

	var key = 'a';
  var put_done = false;
  var put_value = {value: Math.random(), 'remark': 'testing'};
  put_value.id = key;
  var put_value_received;

  waitForCondition(
      // Condition
      function() { return put_done; },
      // Continuation
      function() {
        assertEquals('put a 1', 'a', put_value_received);


      },
      100, // interval
      1000); // maxTimeout

  db.put(store_name, put_value).addCallback(function(value) {
    console.log('receiving value callback.');
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
        assertObjectEquals('get ', put_value, get_value_received);
        reachedFinalContinuation = true;
      },
      100, // interval
      1000); // maxTimeout

  db.get(store_name, key).addCallback(function(value) {
    console.log('receiving get value callback ' + key + ' = ' + JSON.stringify(value) + ' ' + typeof value);
    get_value_received = value;
    get_done = true;
  });
};


var test_6_put_nested_keyPath = function() {
  var store_name = 'ts1';
  var db_name = 'test21';

	var schema = new ydn.db.DatabaseSchema(1);
	schema.addStore(new ydn.db.StoreSchema(store_name, 'id.$t'));

  var db = new ydn.db.Storage(db_name, schema, options);

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
            2000); // maxTimeout


        db.get(store_name, key).addCallback(function(value) {
          console.log('receiving get value callback ' + key + ' = ' + JSON.stringify(value) + ' ' + typeof value);
          get_value_received = value;
          get_done = true;
        });
      },
      100, // interval
      2000); // maxTimeout

  db.put(store_name, put_value).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value_received = value;
    put_done = true;
  });
};


var test_7_put_get_array = function() {
  var store_name = 'ts1';
  var db_name = 'test71';

	var schema = new ydn.db.DatabaseSchema(1);
	schema.addStore(new ydn.db.StoreSchema(store_name, 'id'));

  var db = new ydn.db.Storage(db_name, schema, options);

  var objs = [
    {id: 'qs1', value: Math.random()},
    {id: 'qs2', value: Math.random()},
    {id: 'qt', value: Math.random()}
  ];

  var put_value_received;
  var put_done;
  waitForCondition(
      // Condition
      function() { return put_done; },
      // Continuation
      function() {
        assertArrayEquals('put objs', [objs[0].id, objs[1].id, objs[2].id],
          put_value_received);
      },
      100, // interval
      2000); // maxTimeout

  db.put(store_name, objs).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value_received = value;
    put_done = true;
  });


  var test_get = function(idx) {
    var key = objs[idx].id;
    var get_done = false;
    var get_value_received = undefined;
    waitForCondition(
        // Condition
        function() { return get_done; },
        // Continuation
        function() {
          assertObjectEquals('get ' + key, objs[idx], get_value_received);
          reachedFinalContinuation = true;
        },
        100, // interval
        1000); // maxTimeout

    db.get(store_name, key).addCallback(function(value) {
      console.log('receiving get value callback ' + key + ' = ' + JSON.stringify(value) + ' ' + typeof value);
      get_value_received = value;
      get_done = true;
    });
  };

  test_get(0);
  test_get(1);

};


var test_12_put_arr = function() {
  var db_name = 'test_12';
  var db = new ydn.db.Storage(db_name, basic_schema, options);
  assertEquals('db', 'websql', db.type());

  var arr = [];
  var n = ydn.db.req.WebSql.RW_REQ_PER_TX * 2.5;
  for (var i = 0; i < n; i++) {
    arr.push({id: 'a' + i, value: 'a' + Math.random()});
  }

  var hasEventFired = false;
  var results;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertEquals('length', arr.length, results.length);
        for (var i = 0; i < arr.length; i++) {
          assertEquals('1', arr[i].id, results[i]);
        }

        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback.');
    results = value;
    hasEventFired = true;
  }).addErrback(function(e) {
        hasEventFired = true;
        console.log('Error: ' + e);
      });
};



var test_41_keyRange = function () {
  var store_name = 'ts1';
  var db_name = 'test_41_62';

  var schema = new ydn.db.DatabaseSchema(1);
  var indexSchema = new ydn.db.IndexSchema('value', ydn.db.DataType.INTEGER, true);
  schema.addStore(new ydn.db.StoreSchema(store_name, 'id', false, undefined, [indexSchema]));
  var db = new ydn.db.Storage(db_name, schema, options);

  var objs = [
    {id:'qs0', value: 0, type: 'a'},
    {id:'qs1', value: 1, type: 'a'},
    {id:'at2', value: 2, type: 'b'},
    {id:'bs1', value: 3, type: 'b'},
    {id:'bs2', value: 4, type: 'c'},
    {id:'bs3', value: 5, type: 'c'},
    {id:'st3', value: 6, type: 'c'}
  ];


  var done;
  var result;
  waitForCondition(
      // Condition
      function () {
        return done;
      },
      // Continuation
      function () {
        assertEquals('length', 2, result.length);
        assertArrayEquals([objs[3], objs[4]], result);

        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(store_name, objs).addCallback(function (value) {
    console.log(['receiving value callback.', value]);

    var key_range = ydn.db.KeyRange.bound(2, 5, true, true);
    var q = new ydn.db.Query(store_name, 'value', undefined, key_range);

    db.fetch(q).addBoth(function (value) {
      console.log('fetch value: ' + JSON.stringify(value));
      result = value;
      done = true;
    });
  }).addErrback(function(e) {
        console.log(e.stack);
        console.log(e);
        assertFalse(true, 'Error');
      });

};


var test_71_offset_limit = function () {
  var store_name = 'ts1';
  var db_name = 'test_71_51';

  var schema = new ydn.db.DatabaseSchema(1);
  var indexSchema = new ydn.db.IndexSchema('id', ydn.db.DataType.INTEGER, true);
  schema.addStore(new ydn.db.StoreSchema(store_name, 'id', false, ydn.db.DataType.INTEGER, [indexSchema]));
  var db = new ydn.db.Storage(db_name, schema, options);

   var objs = [
    {value:'qs0', id: 0, type: 'a'},
    {value:'qs1', id: 1, type: 'a'},
    {value:'at2', id: 2, type: 'b'},
    {value:'bs1', id: 3, type: 'b'},
    {value:'bs2', id: 4, type: 'c'},
    {value:'bs3', id: 5, type: 'c'},
    {value:'st3', id: 6, type: 'c'}
  ];

  var offset = 2;
  var limit = 2;
  var target = objs.slice(offset, offset + limit);

  var done;
  var result;
  waitForCondition(
    // Condition
    function () {
      return done;
    },
    // Continuation
    function () {
      console.log('result: ' + JSON.stringify(result));
      console.log('target: ' + JSON.stringify(target));
      assertEquals('length', target.length, result.length);
      assertArrayEquals(target, result);

      reachedFinalContinuation = true;
    },
    100, // interval
    2000); // maxTimeout


  db.put(store_name, objs).addBoth(function (value) {
    console.log(['receiving value callback.', value]);

    var q = new ydn.db.Query(store_name, 'id');

    db.fetch(q, limit, offset).addBoth(function (value) {
      console.log('fetch value: ' + JSON.stringify(value));
      result = value;
      done = true;
    });
  });

};


var test_74_where = function () {
  var store_name = 'ts1';
  var db_name = 'test_74_where1';

  var schema = new ydn.db.DatabaseSchema(1);
  schema.addStore(new ydn.db.StoreSchema(store_name, 'id'));
  var db = new ydn.db.Storage(db_name, schema, options);

  var objs = [
    {id:'qs0', value: 0, type: 'a'},
    {id:'qs1', value: 1, type: 'a'},
    {id:'at2', value: 2, type: 'b'},
    {id:'bs1', value: 3, type: 'b'},
    {id:'bs2', value: 4, type: 'c'},
    {id:'bs3', value: 5, type: 'c'},
    {id:'st3', value: 6, type: 'c'}
  ];


  var done;
  var result;
  waitForCondition(
      // Condition
      function () {
        return done;
      },
      // Continuation
      function () {
        assertEquals('length', 2, result.length);
        assertArrayEquals([objs[3], objs[4]], result);

        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(store_name, objs).addBoth(function (value) {
    console.log(['receiving value callback.', value]);

    var q = new ydn.db.Query(store_name).where('value', '<', 5, '>', 2);

    db.fetch(q).addBoth(function (value) {
      console.log('fetch value: ' + JSON.stringify(value));
      result = value;
      done = true;
    });
  });

};


var test_8_query_start_with = function() {
  var store_name = 'ts1';
	var db_name = 'test81';
	var schema = new ydn.db.DatabaseSchema(1);
	schema.addStore(new ydn.db.StoreSchema(store_name, 'id'));
  var db = new ydn.db.Storage(db_name, schema, options);


  var objs = [
    {id: 'as1', value: Math.random()},
    {id: 'as2', value: Math.random()},
    {id: 'at', value: Math.random()}
  ];

  var put_value_received;
  var put_done;
  waitForCondition(
      // Condition
      function() { return put_done; },
      // Continuation
      function() {
        assertArrayEquals('put objs', [objs[0].id, objs[1].id, objs[2].id],
          put_value_received);
      },
      100, // interval
      2000); // maxTimeout

  db.put(store_name, objs).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value_received = value;
    put_done = true;
  });

  var key = 'as1';
  var get_done;
  var get_value_received;
  waitForCondition(
      // Condition
      function() { return get_done; },
      // Continuation
      function() {
        assertObjectEquals('get ' + key, objs[0], get_value_received);
      },
      100, // interval
      1000); // maxTimeout

  db.get(store_name, key).addCallback(function(value) {
    console.log('receiving get value callback ' + key + ' = ' + JSON.stringify(value) + ' ' + typeof value);
    get_value_received = value;
    get_done = true;
  });

  var get2_done;
  var get2_value_received;
  waitForCondition(
      // Condition
      function() { return get2_done; },
      // Continuation
      function() {
        assertEquals('obj length', objs.length - 1, get2_value_received.length);
				assertEquals('id ' + objs[0].id, objs[0].id, get2_value_received[0].id);
				assertEquals('id ' + objs[1].id, objs[1].id, get2_value_received[1].id);
				assertObjectEquals('get ' + objs[0].id, objs[0], get2_value_received[0]);
        assertObjectEquals('get ' + objs[1].id, objs[1], get2_value_received[1]);
        reachedFinalContinuation = true;
      },
      100, // interval
      1000); // maxTimeout


  var q = new ydn.db.Query(store_name, 'id', 'next', ydn.db.KeyRange.starts('as'));

  db.fetch(q).addCallback(function(value) {
		console.log(['Receiving ', value])
    get2_value_received = value;
    get2_done = true;
  });

};


var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);


