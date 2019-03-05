## Making L110

### Steps include

* Get, build and start the Graffiticode host app (https://github.com/graffiticode/graffiticode).
* Clone and initialize the L110 compiler.
  * `$ git clone git@github.com:artcompiler/L110.git`
  * `$ cd L110`
  * `$ npm install`
* Clone and build mathcore (while in the L107 root directory.)
  * `$ git clone git@github.com:artcompiler/mathcore.git`
  * `$ cd mathcore`
  * `$ git pull origin L110`
  * `$ git checkout L110`
  * `$ npm install`
  * `$ make`
  * `$ cd ..`
* While still in the `./L110` directory, clone and build the 'latexsympy' repo.
  * `$ git clone git@github.com:artcompiler/latexsympy.git`
  * `cd latexsympy`
  * `npm install`
  * `make`
  * `$ cd ..`
* Build and start L110.
  * `$ make`
* Make sure everything is good.
  * In a browser, go to "localhost:3000/lang?id=110".
  * Copy the following into code view: `equivSymbolic "(x+2)(x+3)" "x^2+5x+6"..`
  * See in the form view this: https://www.graffiticode.com/form?id=XZgF1ev6tM
