// exFAT volumes make readlink() fail with EISDIR (or EISDIR-like errors) for regular
// files and folders, where Node tooling expects EINVAL ("not a symlink"). Next.js and
// webpack treat EINVAL as "no link" and carry on, so translate the error code.
const fs = require("fs");

const fix = (err) => {
  if (err && err.code === "EISDIR") {
    err.code = "EINVAL";
    err.errno = -4071;
  }
  return err;
};

const origCb = fs.readlink;
fs.readlink = function (p, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = undefined;
  }
  return origCb.call(fs, p, opts, (err, res) => cb(fix(err), res));
};

const origSync = fs.readlinkSync;
fs.readlinkSync = function (p, opts) {
  try {
    return origSync.call(fs, p, opts);
  } catch (e) {
    throw fix(e);
  }
};

const origP = fs.promises.readlink;
fs.promises.readlink = function (p, opts) {
  return origP.call(fs.promises, p, opts).catch((e) => {
    throw fix(e);
  });
};
