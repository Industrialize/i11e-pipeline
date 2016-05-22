# i11e pipeline

## create a pipeline

You can use *createPipeline* method to create a pipeline model

```javascript
const Pipeline = require('i11e-pipeline');

var MyPipeline = Pipeline.createPipeline({
  initPipeline() {
    // optional, init the pipeline
  },

  process(source) {
    return source._()
      .install(robotA)
      .install(robotB);
  }
});

var myPipeline = new MyPipeline();

myPipeline._()
  .drive();

myPipeline.$().push({});
```

## shortcut to create a pipeline

```javascript
const Pipeline = require('i11e-pipeline');

var myPipeline = Pipeline.pipeline((source) => {
  return source._()
    .install(robotA)
    .install(robotB);
});
```
