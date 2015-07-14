# Elm Test Runner

Runs elm tests written using [Elm-Test](http://package.elm-lang.org/packages/deadfoxygrandpa/Elm-Test/1.0.4) on the command line using PhantomJS.

## Setup

Setup Elm tests as usual but use the Elm-Test HTML runner provided here: [elm-test-html](https://github.com/samuelrayment/elm-test-html)
instead of a standard Elm-Test runner (the classes in the HTML are used to extract the results from phantom.js).

## Usage

```
elm-test-runner path_to_elm_test_script.elm
```

e.g.

```
elm-test-runner js/TestSuite.elm
```
