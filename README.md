# Webpack test app

One of the front-enders in my development project kept complaining about the
fact that we are using Webpacker to leverage Javascript, CSS and images in our
project. Webpacker is pretty awesome but it adds a lot of extra stuff to the
webpacker configuration, it turns the configuration into a murky yaml file and
rails tends to run all kinds of own scripts on top of webpack like rails' native
uglifier and the likes.

So this is a test app that utilizes webpack without the Webpacker gem.
The target of this project is to try out mixing vanilla Webpack with rails.

In this README I'll go over:

- How to install Webpack in a brand new rails project
- How to run the rails project in development/test server mode
- How to compile for production.

Buckle up and strap in!

## Create a new rails project with vanilla webpack

(how to replicate the crazyness in this repo)

### Bootstrap

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
(these steps are semi-not-needed as webpack-cli will replace our package.json),
but I've noticed the npx webpack-cli script to be finnicy, so I'll include these
steps anyway.

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

From here it's quite simple.
We remove (or divide) the generated webpack.config.js file into a development and
a production file.

In development we want to run a dev-server and output our files to the rails tmp
directory. Check out `webpack.config.dev.js` to see how I set it up.

In production we want to minify as much as possible and add a content-hash to
our file name to make sure we aren't running into troubles with the caches of
our users. The build should be placed in rails public folder (static assets
directory in RoR). Check out `webpack.config.prod.js` to see how I set it up.

Lastly, you might want to re-add the config bits index.ts, since webpack
probably removed those.

### The last 3 things we need to deal with now are:

- When building put a pointer in place to tell rails where to find the latest
  `application-[hash].js`
- Read the pointer when starting the rails server
- Put a piece of logic in place to link Rails HTML to the `application-[hash].js`
  from our pointer.
- create a `bin/wrails` script to boot up our dev env.

#### We start with build.

Create a new list of directories and a `.keep`-file called
`config/webpack/pointers/.keep`. We'll use this folder to insert pointers.

With that done, we need to update our package.json to have the correct build and
serve scripts. Check `package.json` for the correct logic.

Lastly we'll need a build script. Check out `scripts/webpack_build.sh` for an OK
example. In the last step of this build script the name of the
application-[hash].js is read from public/frontend and then inserted in a txt
file in `config/webpack/pointers`. We'll use this pointer in the next step

You can now run this build script before or after `rails assets:precompile` to
bundle your Webpack shenanigans.

#### Reading the pointer on application-up

For this I went the easiest step possible. I simply read the pointer from the
disk when the rails server boots up and set it as a global application
configuration. Check out `config/initializers/webpack_application_file.rb` to
see how I achieved this.

#### Put a piece of logic in place to load the correct application.js

For this step you will need to install "HTTParty" in your Gemfile. Check mine to
see what versions I'm using.

We'll check if our server is running on development or test and if so if the
application.js on localhost port 3035 (webpack-dev-server) is reachable.
If so we link our `<script src>` to the webpack-dev-server. If not, we'll serve
the application.js from our pointer. If neither are available we'll throw an
error telling the user to enable either one of the two.

Check `app/helpers/application_helper.rb` and
`app/views/layouts/application.html.erb` to see how I implemented this.

### Create a bin/wrails script to boot both rails and webpack in dev

For this step you will need to install "foreman" in your Gemfile. check mine to
see what versions I'm using.

We'll insert a new script in `bin` to start foreman with a development Procfile.
Check `bin/wrails` (don't forget to `chmod +x` yours) and `Procfile.dev` in my
project to get a feel on how I did this.

And with that you're done. Execute `bin/wrails` to start hacking!

PS: Check the last lines of my `.gitignore` to learn how to deal with all these
new files. you probably don't want to commit your build output or pointer.txt.

## Install and use this project instead

execute the following commands (assuming you have ruby & yarn installed on your
computer)

```
bundle install
yarn install
```

To start the server in development simply execute

```
bin/wrails
```

## Building for production

I haven't gone through the hoops yet to insert the webpack build script in my
rails precompiler. So you'll need to do that yourself (if you use Heroku for
your deployments, you will need to insert the build script in your precompiler
to avoid having to create your own heroku buildpack)

Execute:

```
bin/rails assets:precompile
./scripts/webpack_build.sh
```

And then execute the rest of your build scripts (If you use docker, put this
step in your `Dockerfile`)

From there your production instance can simply run `RAILS_ENV=production bin/rails s`
or passenger or puma or whatever.
