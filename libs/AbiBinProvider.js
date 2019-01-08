'use strict';

//__NOT_FOR_WEB__BEGIN__
const fs = require('fs'),
  path = require('path');
//__NOT_FOR_WEB__END__

const Linker = require('../libs/utils/linker');

class AbiBinProvider {
  constructor(abiFolderPath, binFolderPath) {
    const oThis = this;
    oThis.abiFolderPaths = [];
    oThis.binFolderPaths = [];
    abiFolderPath = abiFolderPath || '../contracts/abi/';
    binFolderPath = binFolderPath || '../contracts/bin/';
    oThis.addAbiFolderPaths(abiFolderPath);
    oThis.addBinFolderPaths(binFolderPath);
    oThis.custom = oThis.custom || null;
  }

  addAbiFolderPaths(abiFolderPath) {
    const oThis = this;
    if (abiFolderPath && oThis.abiFolderPaths.indexOf(abiFolderPath) < 0) {
      oThis.abiFolderPaths.push(abiFolderPath);
    }
  }

  getAbiFolderPaths() {
    const oThis = this;
    return oThis.abiFolderPaths;
  }

  addBinFolderPaths(binFolderPath) {
    const oThis = this;
    if (binFolderPath && oThis.binFolderPaths.indexOf(binFolderPath) < 0) {
      oThis.binFolderPaths.push(binFolderPath);
    }
  }

  getBinFolderPaths() {
    const oThis = this;
    return oThis.binFolderPaths;
  }

  addABI(contractName, abiFileContent) {
    const oThis = this;

    oThis.custom = oThis.custom || {};

    let abi;
    if (typeof abiFileContent === 'string') {
      //Parse it.
      abi = JSON.parse(abiFileContent);
    } else if (typeof abiFileContent === 'object') {
      abi = abiFileContent;
    } else {
      let err = new Error('Abi should be either JSON String or an object');
      throw err;
    }

    let holder = (oThis.custom[contractName] = oThis.custom[contractName] || {});
    if (holder.abi) {
      let err = new Error(`Abi for Contract Name ${contractName} already exists.`);
      throw err;
    }

    holder.abi = abi;
  }

  addBIN(contractName, binFileContent) {
    const oThis = this;

    oThis.custom = oThis.custom || {};

    if (typeof binFileContent !== 'string') {
      //Parse it.
      let err = new Error('Bin should be a string');
      throw err;
    }

    let holder = (oThis.custom[contractName] = oThis.custom[contractName] || {});
    if (holder.bin) {
      let err = new Error(`Bin for Contract Name ${contractName} already exists.`);
      throw err;
    }

    holder.bin = binFileContent;
  }

  getABI(contractName) {
    const oThis = this;

    if (oThis.custom && oThis.custom[contractName] && oThis.custom[contractName].abi) {
      return oThis.custom[contractName].abi;
    }

    //__NOT_FOR_WEB__BEGIN__
    let len = oThis.abiFolderPaths.length,
      cnt;
    let currentPath, fPath, abiFileContent, abi;
    for (cnt = 0; cnt < len; cnt++) {
      currentPath = oThis.abiFolderPaths[cnt];
      fPath = path.resolve(__dirname, currentPath, contractName + '.abi');
      if (fs.existsSync(fPath)) {
        abiFileContent = fs.readFileSync(fPath, 'utf8');
        abi = JSON.parse(abiFileContent);
        break;
      }
    }
    //__NOT_FOR_WEB__END__
    return abi;
  }

  getBIN(contractName) {
    const oThis = this;

    if (oThis.custom && oThis.custom[contractName] && oThis.custom[contractName].bin) {
      return oThis.custom[contractName].bin;
    }

    //__NOT_FOR_WEB__BEGIN__
    let len = oThis.binFolderPaths.length,
      cnt;
    let currentPath, fPath, bin;
    for (cnt = 0; cnt < len; cnt++) {
      currentPath = oThis.binFolderPaths[cnt];
      fPath = path.resolve(__dirname, currentPath, contractName + '.bin');
      if (fs.existsSync(fPath)) {
        bin = fs.readFileSync(fPath, 'utf8');
        break;
      }
    }
    if (typeof bin === 'string' && bin.indexOf('0x') != 0) {
      bin = '0x' + bin;
    }
    //__NOT_FOR_WEB__END__
    return bin;
  }

  //Note
  //links is an array of
  //Send as many libInfo as needed.
  //libInfo format:
  /* 
  {
    "name": "NAME_OF_LIB",
    "address": "ADDRESS_OF_DEPLOYED_LIB"
  }
  */
  getLinkedBIN(contractName) {
    const oThis = this;
    let bin = oThis.getBIN(contractName);
    if (!bin) {
      return bin;
    }

    const libs = Array.from(arguments);
    libs.shift();
    let len = libs.length;
    let libraries = {};
    while (len--) {
      let libInfo = libs[len];
      if (typeof libInfo !== 'object' || !libInfo.name || !libInfo.address) {
        throw new Error('Invalid contract info argument at index ' + (len + 1));
      }
      libraries[libInfo.name] = libInfo.address;
    }
    return Linker.linkBytecode(bin, libraries);
  }

  _read(filePath) {
    //__NOT_FOR_WEB__BEGIN__
    filePath = path.join(__dirname, '/' + filePath);
    return fs.readFileSync(filePath, 'utf8');
    //__NOT_FOR_WEB__END__
  }

  static get Linker() {
    return Linker;
  }
}

module.exports = AbiBinProvider;
