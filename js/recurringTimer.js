class RecurringTimer {
  constructor(callback, delay) {
    var timerId,
      start,
      remaining = delay;

    this.pause = function () {
      window.clearTimeout(timerId);
      remaining -= new Date() - start;
    };

    var resume = function () {
      start = new Date();
      timerId = window.setTimeout(function () {
        remaining = delay;
        resume();
        callback();
      }, remaining);
    };

    this.resume = resume;

    this.resume();
  }
}
