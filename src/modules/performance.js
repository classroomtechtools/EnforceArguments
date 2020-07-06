/*
  Very simple tests that indicate that with 20000 calls, there is the following performance degration:
  
  * Named arguments took ~60 milliseconds longer than without enforcement
  * Positional arguments took ~80 milliseconds longer than without enforcement
  
  Output of log:
  [20-05-20 15:37:27:755 HKT] Enforcing positional arguments took 0.079 seconds
  [20-05-20 15:37:27:759 HKT] Regular positional arguments took 0.001 seconds
  [20-05-20 15:37:27:866 HKT] Enforcing named arguments took 0.060 seconds
  [20-05-20 15:37:27:875 HKT] Regular named arguments took 0.003 seconds

  The author concludes that this is acceptable. In the use cases in which this is likely to be deployed, 
    this is not likely to have noticeable impact on the end user.
    
  The author also concludes that using destructuring is slower than positional, but not as much as expected.
 */

function nakedPositional_(a, b, c, d, e, f) { 
}

function enforcedPositional_(a, b, c, d, e, f) {
  positional(arguments, {a: '!string', b: 'number', c: '!boolean', d: 'object', e: Date, f: 'array'});
}

function enforcedNamed_({a, b, c, d, e, f}={}) {
  named(arguments, {a: '!string', b: 'number', c: '!boolean', d: 'object', e: Date, f: 'array'});
}

function nakedNamed_({a, b, c, d, e, f}={}) {
}

function conductPerformanceTests() {
  const iterations = 10000;
  const a = 'string', b = 1234, c = true, d = {hi: 'hi'}, e = new Date(), f = ['one', 'two', 3, 4];
  let start, end, seconds;
  
  start = new Date().getTime();
  for (let x = 0; x <= iterations; x++) {
    enforcedPositional_(a, b, c, d, e, f);
    enforcedPositional_(a, undefined, c);
  }
  end = new Date().getTime();
  seconds = (end - start) / 1000;
  Logger.log(`Took ${seconds} seconds`);

  start = new Date().getTime();
  for (let x = 0; x <= iterations; x++) {
    nakedPositional_(a, b, c, d, e, f);
    nakedPositional_(a, undefined, c);
  }
  end = new Date().getTime();
  seconds = (end - start) / 1000;
  Logger.log(`Took ${seconds} seconds`);

  start = new Date().getTime();
  for (let x = 0; x <= iterations; x++) {
    enforcedNamed_({a, b, c, d, e, f});
    enforcedNamed_({a,c});
  }
  end = new Date().getTime();
  seconds = (end - start) / 1000;
  Logger.log(`Took ${seconds} seconds`);

  start = new Date().getTime();
  for (let x = 0; x <= iterations; x++) {
    nakedNamed_({a, b, c, d, e, f});
    nakedNamed_({a, c});
  }
  end = new Date().getTime();
  seconds = (end - start) / 1000;
  Logger.log(`Took ${seconds} seconds`);

}
