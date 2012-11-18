/**
 * @fileoverview Exports for main ydn-db module.
 *
 */

goog.require('ydn.db.Storage');
goog.require('ydn.db.TxStorage');
goog.require('ydn.db.algo.NestedLoop');


goog.exportSymbol('ydn.db.Iterator', ydn.db.Iterator);
goog.exportProperty(ydn.db.Iterator.prototype, 'continued',
    ydn.db.Iterator.prototype.continued);
goog.exportProperty(ydn.db.Iterator.prototype, 'count',
    ydn.db.Iterator.prototype.count);
goog.exportProperty(ydn.db.Iterator.prototype, 'done',
  ydn.db.Iterator.prototype.done);
goog.exportProperty(ydn.db.Iterator.prototype, 'filter',
  ydn.db.Iterator.prototype.filter);
goog.exportProperty(ydn.db.Iterator.prototype, 'key',
  ydn.db.Iterator.prototype.key);
goog.exportProperty(ydn.db.Iterator.prototype, 'indexKey',
  ydn.db.Iterator.prototype.indexKey);

goog.exportSymbol('ydn.db.Sql', ydn.db.Sql);
goog.exportProperty(ydn.db.Sql.prototype, 'project',
    ydn.db.Sql.prototype.project);
goog.exportProperty(ydn.db.Sql.prototype, 'aggregate',
  ydn.db.Sql.prototype.aggregate);
goog.exportProperty(ydn.db.Sql.prototype, 'where',
    ydn.db.Sql.prototype.where);
goog.exportProperty(ydn.db.Sql.prototype, 'from',
    ydn.db.Sql.prototype.from);
goog.exportProperty(ydn.db.Sql.prototype, 'limit',
  ydn.db.Sql.prototype.limit);
goog.exportProperty(ydn.db.Sql.prototype, 'order',
  ydn.db.Sql.prototype.order);
goog.exportProperty(ydn.db.Sql.prototype, 'offset',
  ydn.db.Sql.prototype.offset);
goog.exportProperty(ydn.db.Sql.prototype, 'reverse',
  ydn.db.Sql.prototype.reverse);
goog.exportProperty(ydn.db.Sql.prototype, 'unique',
  ydn.db.Sql.prototype.unique);


goog.exportSymbol('ydn.db.Storage', ydn.db.Storage);

goog.exportProperty(ydn.db.Storage.prototype, 'scan',
  ydn.db.Storage.prototype.scan);
goog.exportProperty(ydn.db.Storage.prototype, 'map',
  ydn.db.Storage.prototype.map);
goog.exportProperty(ydn.db.Storage.prototype, 'reduce',
  ydn.db.Storage.prototype.reduce);
goog.exportProperty(ydn.db.Storage.prototype, 'execute',
  ydn.db.Storage.prototype.execute);
goog.exportProperty(ydn.db.Storage.prototype, 'open',
    ydn.db.Storage.prototype.fetch);
goog.exportProperty(ydn.db.Storage.prototype, 'setItem',
    ydn.db.Storage.prototype.setItem);
goog.exportProperty(ydn.db.Storage.prototype, 'getItem',
    ydn.db.Storage.prototype.getItem);

goog.exportProperty(ydn.db.TxStorage.prototype, 'scan',
  ydn.db.TxStorage.prototype.scan);
goog.exportProperty(ydn.db.TxStorage.prototype, 'map',
  ydn.db.TxStorage.prototype.map);
goog.exportProperty(ydn.db.TxStorage.prototype, 'reduce',
  ydn.db.TxStorage.prototype.reduce);
goog.exportProperty(ydn.db.TxStorage.prototype, 'execute',
  ydn.db.TxStorage.prototype.execute);
goog.exportProperty(ydn.db.TxStorage.prototype, 'open',
    ydn.db.TxStorage.prototype.fetch);
goog.exportProperty(ydn.db.TxStorage.prototype, 'setItem',
    ydn.db.TxStorage.prototype.setItem);
goog.exportProperty(ydn.db.TxStorage.prototype, 'getItem',
    ydn.db.TxStorage.prototype.getItem);

goog.exportSymbol('ydn.db.KeyRange', ydn.db.KeyRange );
goog.exportProperty(ydn.db.KeyRange, 'upperBound', ydn.db.KeyRange.upperBound);
goog.exportProperty(ydn.db.KeyRange, 'lowerBound', ydn.db.KeyRange.lowerBound);
goog.exportProperty(ydn.db.KeyRange, 'bound', ydn.db.KeyRange.bound);
goog.exportProperty(ydn.db.KeyRange, 'only', ydn.db.KeyRange.only);
goog.exportProperty(ydn.db.KeyRange, 'starts', ydn.db.KeyRange.starts);

goog.exportSymbol('ydn.math.Expression', ydn.math.Expression);
goog.exportProperty(ydn.math.Expression.prototype, 'evaluate',
  ydn.math.Expression.prototype.evaluate);
goog.exportProperty(ydn.math.Expression.prototype, 'compile',
  ydn.math.Expression.prototype.compile);
goog.exportProperty(ydn.math.Expression, 'parseRpn',
  ydn.math.Expression.parseRpn);
goog.exportProperty(ydn.math.Expression, 'parseInfix',
  ydn.math.Expression.parseInfix);

goog.exportSymbol('ydn.db.algo.NestedLoop', ydn.db.algo.NestedLoop);
goog.exportSymbol('ydn.db.algo.AbstractSolver', ydn.db.algo.AbstractSolver);


