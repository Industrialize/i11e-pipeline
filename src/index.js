var defaultPipeline = {
  process() {
    // do nothing, just return the source production line
    return this.source._();
  }
}

var visitors = [];

var exports = {};

/**
 * Create a new pipeline model
 * @param  {Object} delegate Pipeline delegate
 * @return {Pipeline}          Pipeline model
 */
exports.createPipeline = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'initPipeline', 'getModel', 'getHead', 'getTail', 'push', '_', '$', 'process'];
  var createError = require('i11e-utils').error;
  var Box = require('i11e-box');
  var _ = require('./prodline');
  var Source = require('./Source');

  const Sequence = {
    newName() {
      var Moniker = require('moniker');
      return Moniker.choose();
    }
  };

  if (!delegate) {
    delegate = defaultPipeline;
  }

  class SourceWrapper{
    constructor(pipeline, source) {
      this.pipeline = pipeline;
      this.source = source;
    }

    push(box) {
      if (!Box.isBox(box)) box = new Box(box);

"#if process.env.NODE_ENV !== 'production'";
      for (let visitor of visitors) {
        if (visitor.accept(this.pipeline)) {
          visitor.willProcess(this.pipeline, box);
        }
      }
"#endif";

      return this.source.push(box);
    }

    _() {
      return this.source._();
    }
  }

  class Pipeline {
    constructor(options = {}) {
      this.id = Sequence.newName();
      this.options = options;

      this.setDelegate(delegate);

      // instance properties
      this.name = options.name || 'Anonymous';
      this.comment = options.comment || ""; // comment of this robot, could be initiated from options

      this.tail = null;
      this.outgoings = [];

      // class properties
      this.model = typeof this.delegate.getModel === 'function' ? this.delegate.getModel() : "Unnamed Production Line";
      this.source = new SourceWrapper(this, new Source());

      if (this.delegate.initPipeline) {
        this.delegate.initPipeline.call(this);
      }
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      for (let key in this.delegate) {
        // skip predefined functions
        if (ReserverdFunctions.indexOf(key) >= 0) {
          continue;
        }

        if (typeof this.delegate[key] === 'function') {
          this[key] = this.delegate[key].bind(this);
        }
      }

      return this;
    }

    getId() {
      return this.id;
    }

    getName() {
      return this.name;
    }

    getModel() {
      return this.model;
    }

    /**
     * Push a box to the production line
     * It is equivalant to
     * productionLine.getHead().push(box);
     * @param  {Box} box the box to be pushed to the production line
     * @return {Pipeline}     the pipeline instance
     */
    push(box) {
      if (!Box.isBox(box)) box = new Box(box);
      this.source.push(box);
      return this;
    }

    /**
     * Get the head end of the production line
     * @return {Source} production line source
     */
    getHead() {
      return this.$();
    }

    /**
     * Get the tail end of the production line
     * @return {Stream} production line stream
     */
    getTail() {
      return this._();
    }

    /**
     * Get the head end of the production line, short form of getHead()
     * @return {Source} production line source
     */
    $() {
      return this.source;
    }

    /**
     * Get the tail end of the production line, short form of getTail()
     * @return {Stream} production line stream
     */
    _() {
      if (!this.tail) {
        this.tail = this.delegate.process.call(this)
          .doto((box) => {
"#if process.env.NODE_ENV !== 'production'";
            for (let visitor of visitors) {
              if (visitor.accept(this.pipeline)) {
                visitor.didProcess(this, null, box);
              }
            }
"#endif";

            for (let outgoing of this.outgoings) {
              let stream = _([new Box(box)]);

              if (outgoing.options.filter) {
                stream = stream.accept(outgoing.options.filter);
              }

              if (outgoing.options.tags) {
                stream = stream.tag(outgoing.options.tags);
              }

              stream.doto((box) => {
                outgoing.pipeline.push(box);
              })
              .drive();
            }
          })
          .errors((err, rethrow) => {
"#if process.env.NODE_ENV !== 'production'";
            for (let visitor of visitors) {
              if (typeof visitor.didProcess === 'function') visitor.didProcess(this, err, err.source);
            }
"#endif";
            rethrow(err);
          });
      }

      return this.tail;
    }

    /**
     * Join this pipeline with another one
     * @param  {Pipeline} pipeline the pipeline to join with
     * @param  {Object} options   options
     *                            - filter: the filter function or filter object, see prodline.accept()
     *                            - tags: the tags to add to the box
     */
    join(pipeline, options = {}) {
      this.outgoings.push({
        pipeline: pipeline,
        options: options
      });
    }
  }

  return Pipeline;
}

exports.pipeline = (fn) => {
  var Pipeline = exports.createPipeline({
    process() {
      if (!fn) return this.source._();
      return fn(this.source);
    }
  });

  return new Pipeline();
}

exports.extend = (extension) => {
  visitors = extension.getPipelineVisitors();
}

module.exports = exports;
