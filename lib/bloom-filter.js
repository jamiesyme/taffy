const Fs = require('fs-extra');
const Md5 = require('md5');

class BloomFilter {
	constructor (bitCount = 16384, hashCount = 4) {
		this.bitCount = bitCount;
		this.hashCount = hashCount;
		this._bits = new Array(bitCount);
		this._seeds = '';
		this._hashBitsNeeded = Math.ceil(Math.log(bitCount) / Math.log(2));

		for (let i = 0; i < bitCount; ++i) {
			this._bits[i] = 0;
		}
		for (let i = 0; i < hashCount; ++i) {
			this._seeds = this._seeds + i.toString();
		}
	}

	add (dataStr) {
		for (let i = 0; i < this.hashCount; ++i) {
			const hashStr = Md5(dataStr + this._seeds[i]);
			const hashStrTrunc = hashStr.substr(0, this._hashBitsNeeded / 4 + 1);

			const bitIndex = parseInt(hashStrTrunc, 16) % this.bitCount;

			this._bits[bitIndex] = 1;
		}
	}

	test (dataStr) {
		for (let i = 0; i < this.hashCount; ++i) {
			const hashStr = Md5(dataStr + this._seeds[i]);
			const hashStrTrunc = hashStr.substr(0, this._hashBitsNeeded / 4 + 1);

			const bitIndex = parseInt(hashStrTrunc, 16) % this.bitCount;

			if (this._bits[bitIndex] !== 1) {
				return false;
			}
		}
		return true;
	}

	serialize () {
		const json = {
			h: this.hashCount,
			b: this._bits.join('')
		};
		return JSON.stringify(json);
	}

	static deserialize (data) {
		const json = JSON.parse(data);

		const bf = new BloomFilter(json.b.length, json.h);
		for (let i = 0; i < bf.bitCount; ++i) {
			bf._bits[i] = parseInt(json.b[i]);
		}

		return bf;
	}
}

module.exports = BloomFilter;
