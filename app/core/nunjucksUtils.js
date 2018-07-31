const nunjucksSetup = {

  nunjucksEnv: null,

  get env() {
    if (!this.nunjucksEnv) {
      throw Error('The nunjucks environment has not been set.');
    }
    return this.nunjucksEnv;
  },

  set env(env) {
    this.nunjucksEnv = env;
  }

};

module.exports = { nunjucksSetup };
