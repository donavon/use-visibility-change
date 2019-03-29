# use-visibility-change

A custom React Hook that provides easy access to the visibilitychange event.
Know how long it's been since a user has "seen" your app.

[![npm version](https://badge.fury.io/js/%40use-it%2Fevent-listener.svg)](https://badge.fury.io/js/%40use-it%2Fevent-listener) [![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)

## Features

🕐 Know how long the user has been away from your page.

🕑 `onHide` called when the user changes tabs, closes the current tab, or minimizes the browser.

🕒 `onShow` when the page is once again visible to the user (passing the `lastSeenDate`).

🕓 Persists `lastSeenDate` to `localStorage`.

This hook was inspired by this article on [Web Platorm News](https://webplatform.news/issues/2019-03-27#web-pages-can-now-detect-when-chrome-s-window-is-covered-by-another-window).


## Installation

```bash
$ npm i use-visibility-change
```

or

```bash
$ yarn add use-visibility-change
```

## Usage

Here is a basic setup.

```js
const data = useVisibilityChange(config);
```

### Parameters

You pass a single config object with the following properties.

| Parameter   | Description                                                                                     |
| :---------- | :---------------------------------------------------------------------------------------------- |
| `onHide` | An optional callback function that is called upon closing or navigation away from the current tab, or minimizing the browser. You could use this callback to save the application state. |
| `onShow` | An optional callback function that is called with the same thing as the returned object when the view is restored. You could use this callback to restore the application state, or reset the user's experience if they have been gone for some time. |
| `storageKey` | A string that will be used as the key when persisting the last seen date. Default = "useSaveRestoreState.lastSeenDateUTC" |


### Return

This hook returns a data object with the following keys.

| Property   | Description                                                                                     |
| :---------- | :---------------------------------------------------------------------------------------------- |
| `lastSeenDate` | A Date object representing the date that the user was last "seen". Returns `null` if this is the first time the user visited your site with this browser. |

## Example 1

Here we have a simple case where we render how long it's been since the user has "seen" your app.

```js
const App = () => {
  const { lastSeenDate } = useVisibilityChange();
  return (
    <div>
      <p>Change tabs, navigate away, or close the tab. Then come back.</p>
      {lastSeenDate ? (
        <>
          <p className="hidden-for">
            This page was hidden for{' '}
            <em>{((new Date() - lastSeenDate) / 1000).toFixed(2)} secs</em>
          </p>
          <p>Last seen on: {lastSeenDate.toISOString()}</p>
        </>
      ) : (
        'Welcome new user!'
      )}
    </div>
  );
};
```

### Live demo

You can view/edit the sample code above on CodeSandbox.

[![Edit demo app on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vm6l68k427)

## Example 2

Here is another example that uses the `onHide` and `onShow` callbacks.

```js
let savedTitle;

const onHide = () => {
  savedTitle = document.title;
  document.title = '👋 Bye. See ya later!';
};

const onShow = () => {
  document.title = savedTitle;
};

const App = () => {
  useVisibilityChange({ onShow, onHide });
  return (
    <>
      <h1>useVisibilityChange demo.</h1>
      <p>Change tabs and notice the title.</p>
    </>
  );
};
```

### Live demo

You can view/edit the sample code above on CodeSandbox.

[![Edit demo app on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xj6vz7wn1z)


## License

**[MIT](LICENSE)** Licensed

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="http://donavon.com"><img src="https://avatars3.githubusercontent.com/u/887639?v=4" width="100px;" alt="Donavon West"/><br /><sub><b>Donavon West</b></sub></a><br /><a href="#ideas-donavon" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-donavon" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-donavon" title="Maintenance">🚧</a> <a href="#review-donavon" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/donavon/use-visibility-change/commits?author=donavon" title="Code">💻</a> <a href="#design-donavon" title="Design">🎨</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
