/**
 * @fileoverview JsTestDriver test unit for ydn.store.Storage.
 */

goog.provide('ydn.store.IndexedDbJstest');
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('ydn.db.IndexedDb');
goog.require('ydn.db.test');


ydn.store.IndexedDbJstest = AsyncTestCase('IndexedDbJstest');

ydn.store.IndexedDbJstest.prototype.setUp = function() {
  //console.log('running test for IndexedDbJstest');

  var c = new goog.debug.Console();
  c.setCapturing(true);
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.FINE);
  goog.debug.Logger.getLogger('ydn.db.IndexedDb').setLevel(goog.debug.Logger.Level.FINEST);

  this.dbname = 'test_1';
  this.table = 'test';
  this.schema = {};
  this.schema[this.table] = {'keyPath': 'id'};

};


ydn.store.IndexedDbJstest.prototype.test_special_key = function(queue) {
  var db = new ydn.db.IndexedDb(this.dbname + '2', {});
  ydn.db.test.special_keys_test(queue, db);
};


ydn.store.IndexedDbJstest.prototype.test_put_get_object = function(queue) {
  var db = new ydn.db.IndexedDb(this.dbname + '3', this.schema);
  ydn.db.test.run_put_get_tests(queue, db);
};
