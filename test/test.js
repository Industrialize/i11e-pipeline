exports['test pipeline'] = {
  'test pipeline': (test) => {
    const createPipeline = require('../lib/index').createPipeline;
    const createRobot = require('i11e-robot').createRobot;
    const Box = require('i11e-box');

    var GreetingRobot = createRobot({
      process(box, done) {
        var name = box.get('name');
        done(null, box.set('greetings', `Hello! ${name}`));
      }
    });

    var GreetingPipeline = createPipeline({
      process() {
        return this.source._()
          .install(new GreetingRobot());
      }
    });

    var pipeline = new GreetingPipeline();

    // here demonstrate how to use pipeline
    // 1. connect result handler to handle the pipeline result
    pipeline._()
      .doto((box) => {
        test.equal(box.get('greetings'), 'Hello! John');
        test.done();
      })
      .drive();

    // 2. push input box to the pipeline
    pipeline.push(new Box({
      name: 'John'
    }));
  },

  'test default pipeline': (test) => {
    const pipeline = require('../lib/index').pipeline;
    const createRobot = require('i11e-robot').createRobot;
    const Box = require('i11e-box');

    var GreetingRobot = createRobot({
      process(box, done) {
        var name = box.get('name');
        done(null, box.set('greetings', `Hello! ${name}`));
      }
    });

    var pl = pipeline((source) => {
      return source._().install(new GreetingRobot());
    });

    pl._().doto((box) => {
      test.equal(box.get('greetings'), 'Hello! John');
      test.done();
    })
    .drive();

    test.done();
  }

  // 'test branch pipeline': (test) => {
  //   const Constants = require('../index').Constants;
  //   const Source = require('../index').Source;
  //   const createPipeline = require('../index').createPipeline;
  //   const Box = require('../index').Box;
  //
  //   var GreetingPipeline = createPipeline({
  //     process() {
  //       return this.source._()
  //         .accept({
  //           $cmd: 'example.greeting'
  //         })
  //         .gp((box, done) => {
  //           var name = box.get('name');
  //           done(null, box.set('greetings', `Hello! ${name}`));
  //         });
  //     }
  //   });
  //
  //   var MonitoringPipeline = createPipeline({
  //     isNotify() {
  //       return true;
  //     },
  //
  //     process() {
  //       return this.source._()
  //         .gp((box, done) => {
  //           console.log('branch pipeline: notify, processing box:');
  //           box.print();
  //           test.equal(box.get('greetings'), 'Hello! John');
  //           done(null, box);
  //         });
  //     }
  //   });
  //
  //   var RequestPipeline = createPipeline({
  //     isNotify() {
  //       return false;
  //     },
  //
  //     process() {
  //       return this.source._()
  //         .gp((box, done) => {
  //           console.log('branch pipeline: request, processing box:');
  //           box.print();
  //           box.set('requested', true);
  //           done(null, box);
  //         });
  //     }
  //   });
  //
  //   var pipeline = GreetingPipeline();
  //
  //   // here demonstrate how to use pipeline
  //   // 1. connect result handler to handle the pipeline result
  //   var pl = pipeline._()
  //     .doto((box) => {
  //       console.log('trunk pipeline, processing box:');
  //       box.print();
  //     })
  //     .branch(
  //       MonitoringPipeline(),
  //       RequestPipeline()
  //     )
  //     .doto((box) => {
  //       console.log('trunk pipeline, processing box:');
  //       box.print();
  //       test.equal(box.get('greetings'), 'Hello! John');
  //       test.equal(box.get('requested'), true);
  //       test.done();
  //     })
  //     .errors((err) => {
  //       console.error(err.message);
  //       test.ok(false, err.message);
  //       test.done();
  //     })
  //     .drive();
  //
  //   // 2. push input box to the pipeline
  //   pipeline.push(new Box({
  //     $cmd: 'example.greeting',
  //     name: 'John'
  //   }));
  // }
}
