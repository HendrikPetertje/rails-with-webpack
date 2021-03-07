# Webpack test app

This is a test app that utilizes webpack without the Webpacker gem.
The target of this project is to try out mixing vanilla Webpack with rails.

In previous projects where both Webpack and Sprockets do their thing I noticed
that it's hard to contain one javascript compiler (uglifier running on both
sprockets and webpack, ruby generating webpack config and lots of automatically
added plugins and configs that are hard to work with when dealing with specific
frameworks).

The target of this Readme is to go over

- How to install Webpack in a brand new rails project
- How to run the rails project in development/test server mode (using rspec &
  capybara)
- How to compile for production.

Buckle up and strap in!

## Create a new rails project with vanilla webpack

Install rails and generate a new rails app

```
gem install rails
rails new webpack_app --skip-javascript
```

Create a pages#index controller as root

```
rails g controller pages

in your favorite editor:

+ app/views/pages/index.html.erb:
I am a homepage

+ config/routes.rb
root 'pages#index'
```

Check if everything is working so far by starting a rails server, create a db
if needed

```
rails s
bin/rails db:create
```

Initialize NodeJS and install Webpack (with typescript) dependencies

```
npm init --y
yarn add -D wepack-cli webpack typescript ts-loader declaration-bundler-webpack-plugin copy-webpack-plugin clean-webpack-plugin @types/node @types/webpack
```

Your `package.json` should look something like this

```
{
  "name": "webpack_app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "directories": {
    "lib": "lib"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/node": "^14.14.32",
    "@types/webpack": "^4.41.26",
    "clean-webpack-plugin": "^3.0.0",
    "copy-webpack-plugin": "^8.0.0",
    "declaration-bundler-webpack-plugin": "^1.0.3",
    "ts-loader": "^8.0.17",
    "typescript": "^4.2.3",
    "webpack": "^5.24.3",
    "wepack-cli": "0.0.1-security"
  }
}
```

Add typescript config. Open a new file in your apps main directory called
`tsconfig.json` and insert the following details:

```
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "removeComments": true,
    "preserveConstEnums": true,
    "sourceMap": true,
    "declaration": true,
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["app/webpack"]
}
```

Create a new folder structure in your app folder like so:

```
webpack_app/
│
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   └─+ webpack/
│   │   ├─+ index.ts
│   │   └─+ helloWorld.ts
├── node_modules/
├── Gemfile
├── Gemfile.lock
├── package.json
├── tsconfig.json
├── yarn.lock
└── ...
```

In `app/webpack/helloWorld.ts` insert:

```
const helloWorld = () => {
  console.log('Hello World!');
};

export default helloWorld;
```

In `app/webpack/index.ts` insert:

```
import helloWorld from './helloWorld';

helloWorld();
```

Now that you have modules, its time to initialize them into Webpack.
Execute:

```
npm rm -g webpack-cli
yarn add -D webpack-cli
yarn run webpack-cli init
```

Answer the questions like this:

```
Would you like to install '@webpack-cli/init' package? (That will run 'yarn add -D @webpack-cli/init') (Y/n) › Y
Will your application have multiple bundles? (y/N) › N
Which will be your application entry point? › app/webpack/index.ts
In which folder do you want to store your generated bundles? › public/frontend
Will you use one of the below JS solutions? (Use arrow keys) › Typescript
Will you use one of the below CSS solutions? › SASS
Will you bundle your CSS files with MiniCssExtractPlugin? › No (for now)
Do you want to use webpack-dev-server? (Y/n) › Y
Do you want to simplify the creation of HTML files for your bundle? › N (we won't be using HTML anyway)
Do you want to add PWA support? (Y/n) › Y (for fun)
Overwrite package.json? (ynaxdH) Y
...
overwrite everything but the readme
```
