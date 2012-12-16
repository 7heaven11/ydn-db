
goog.require('goog.debug.Console');
goog.require('goog.testing.jsunit');
goog.require('ydn.async');
goog.require('ydn.db.Storage');
goog.require('goog.testing.PropertyReplacer');


var reachedFinalContinuation, schema, db, debug_console, objs;
var db_name = 'test_sql_1';
var store_name = 'st';

var setUp = function() {
  if (!debug_console) {
    debug_console = new goog.debug.Console();
    debug_console.setCapturing(true);
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.WARNING);
    //goog.debug.Logger.getLogger('ydn.gdata.MockServer').setLevel(goog.debug.Logger.Level.FINEST);
    //goog.debug.Logger.getLogger('ydn.db').setLevel(goog.debug.Logger.Level.FINE);
    //goog.debug.Logger.getLogger('ydn.db.con').setLevel(goog.debug.Logger.Level.FINEST);
    //goog.debug.Logger.getLogger('ydn.db.req').setLevel(goog.debug.Logger.Level.FINEST);
  }
  //ydn.db.core.req.IndexedDb.DEBUG = false;

  var index_x = new ydn.db.schema.Index('x', ydn.db.schema.DataType.NUMERIC, true);
  var indexSchema = new ydn.db.schema.Index('value', ydn.db.schema.DataType.TEXT, true);
  var typeIndex = new ydn.db.schema.Index('type', ydn.db.schema.DataType.TEXT, false);
  var store_schema = new ydn.db.schema.Store(store_name, 'id', false,
    ydn.db.schema.DataType.INTEGER, [index_x, indexSchema, typeIndex]);
  schema = new ydn.db.schema.Database(undefined, [store_schema]);
  db = new ydn.db.Storage(db_name, schema, options);

  objs = [
    {id: 0, x: -1, value: 'ba', type: 'a', remark: 'test ' + Math.random()},
    {id: 1, x: 0, value: 'a2', type: 'a', remark: 'test ' + Math.random()},
    {id: 2, x: 2, value: 'b', type: 'b', remark: 'test ' + Math.random()},
    {id: 3, x: 3, value: 'b1', type: 'b', remark: 'test ' + Math.random()}
  ];

  db.clear(store_name);
  db.put(store_name, objs).addCallback(function (value) {
    console.log(db + ' ready.');
  });
};

var tearDown = function() {
  assertTrue('The final continuation was not reached', reachedFinalContinuation);
  db.close();
};



var test_21_select_all = function() {

  var hasEventFired = false;
  var result;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertArrayEquals('all records', objs, result);

        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout

  db.execute('SELECT * FROM "st"').addCallback(function (q_result) {
    //console.log(db.explain(q));
    //console.log('receiving query ' + JSON.stringify(q_result));
    result = q_result;
    hasEventFired = true;
  })

};

var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);


