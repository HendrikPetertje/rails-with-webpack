import asyncDocumentReady from "./utils/asyncDocumentready";

const helloWorld = () => {
  console.log('Hello World!');

  asyncDocumentReady(() => {
    document.querySelector('.someNamedDiv').innerHTML = 'I was inserted by webpack, not webpacker!'
  });
};

export default helloWorld;
