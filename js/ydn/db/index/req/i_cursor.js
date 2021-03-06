/**
 * @fileoverview cursor interface.
 */


goog.provide('ydn.db.index.req.ICursor');


/**
 * @interface
 */
ydn.db.index.req.ICursor = function() {};


/**
 * Callback to receive requested cursor value.
 *
 * Requester must handle the cursor value synchronously and decide the
 * next move by invoking forward.
 * @param {*} primary_key
 * @param {*} key
 * @param {*} value
 */
ydn.db.index.req.ICursor.prototype.onNext = goog.abstractMethod;


/**
 *
 * @param {Error} error
 */
ydn.db.index.req.ICursor.prototype.onError = goog.abstractMethod;

/**
 * onSuccess handler is called before onNext callback. The purpose of
 * onSuccess handler is apply filter. If filter condition are not meet,
 * onSuccess return next advancement value skipping onNext callback.
 *
 * @param {*} primary_key
 * @param {*} key
 * @param {*} value
 * @return {*}
 */
ydn.db.index.req.ICursor.prototype.onSuccess = goog.abstractMethod;


/**
 * Move cursor to next position.
 * @param {*} next position by giving index key. if no key is given, this
 * will move next cursor position. If end of cursor is reach, this will
 * invoke empty onNext callback.
 */
ydn.db.index.req.ICursor.prototype.forward = goog.abstractMethod;


/**
 * Move cursor to a given position by primary key.
 *
 * This will iterate the cursor records until the primary key is found without
 * changing index key. If index has change during iteration, this will invoke
 * onNext callback with resulting value. If given primary key is in wrong
 * direction, this will rewind and seek.
 * @param {*} primary key.
 * @param {*} index key.
 * @param {boolean} inclusive.
 */
ydn.db.index.req.ICursor.prototype.seek = goog.abstractMethod;


/**
 * Move cursor position to the primary key while remaining on same index key.
 * @param {*} primary_key
 */
ydn.db.index.req.ICursor.prototype.continuePrimaryKey = goog.abstractMethod;


/**
 * Move cursor position to the effective key.
 * @param {*} effective_key
 */
ydn.db.index.req.ICursor.prototype.continueEffectiveKey = goog.abstractMethod;


/**
 * Move cursor position to the effective key.
 * @param {number} number_of_step
 */
ydn.db.index.req.ICursor.prototype.advance = goog.abstractMethod;


/**
 * Restart the cursor. If previous cursor position is given,
 * the position is skip.
 * @param {*} effective_key previous position.
 * @param {*} primary_key
 */
ydn.db.index.req.ICursor.prototype.restart = goog.abstractMethod;