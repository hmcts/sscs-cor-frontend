const requireDirectory = require('require-directory');

const steps = requireDirectory(module);

const actions = {};

function setActorActions(data) {
  for (const k in data) {
    if (data.hasOwnProperty(k)) {
      actions[k] = data[k];
    }
  }
}

module.exports = () => {
  const stepsKeys = Object.keys(steps);

  for (const step in stepsKeys) {
    const sectionKeys = Object.keys(steps[stepsKeys[step]]);

    for (const section in sectionKeys) {
      setActorActions(steps[stepsKeys[step]][sectionKeys[section]]);
    }
  }

  return actor(actions);
};

module.exports = function() {

  let stepsKeys = Object.keys(steps);

  for (let step in stepsKeys) {

    let sectionKeys = Object.keys(steps[stepsKeys[step]]);

    for (let section in sectionKeys) {

      setActorActions(steps[stepsKeys[step]][sectionKeys[section]]);
    }

  }

  return actor(actions);
};