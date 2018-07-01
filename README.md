# Frontend Starter Kit

Hi! This is a front-end starter kit with organised file structure and gulpfile.js used by [@harsimarriar96](http://www.github.com/harsimarriar96).


## Usage

> Step 1:  `npm install gulp -D` (*Gulp installation*)

> Step 2: `bower install <package> --save` (*Install dependencies such as bootstrap*)

> Step 3: Download any other components to the `components/` directory.

> Step 4: Start development in `src/` directory.



#### `Gulp test`
> Starts a testing server using BrowserSync.

#### `Gulp deploy`
> Create a production build in the dist folder.

## Features

|Feature| Summary |
|--|--|
| Preprocessing |Multiple and Simultaenous use of Sass, Less, Stylus.
|Template Engine  |Jade support   |
| Code Linting | Code Linting support using ESLint |
| Compression | CSS, Javascript even ES6 compression supported. |
| LiveReloading | LiveReloading with BrowserSync |
| Cross Device Sync| `gulp test` starts the test server with cross device synchronisation & LiveReloading 
|Auto-Injecting| No need to link any css or js in code, use bower and/or download files to `components/` folder.|
