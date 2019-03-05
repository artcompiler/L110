## Making L110

### Steps include

* Get, build and start the Graffiticode host app (https://github.com/graffiticode/graffiticode).
* Clone and initialize the L110 compiler.
  * `$ git clone git@github.com:graffiticode/L110.git`
  * `$ cd L110`
  * `$ npm install`
* Clone and build mathcore (while in the L107 root directory.)
  * `$ git clone git@github.com:artcompiler/mathcore.git`
  * `$ cd mathcore`
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
