let ioInstance;

function setIOInstance(io) {
  ioInstance = io;
}

function getIOInstance() {
  return ioInstance;
}

module.exports = {
  setIOInstance,
  getIOInstance,
};
