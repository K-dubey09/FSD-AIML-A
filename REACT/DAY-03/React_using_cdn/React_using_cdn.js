const e = React.createElement;

function App() {
    return e('div', null, 'Hello, React using CDN!');
}

const rootElement = document.getElementById('root');
ReactDOM.render(e(App), rootElement);

