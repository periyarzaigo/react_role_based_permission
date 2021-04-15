import logo from './logo.svg';
import './App.css';
import store from './components/rolePermissionsStore';
import LoginPage from './components/login';
import { Provider } from 'react-redux';

function App() {
  return (<Provider store={store}>
    <div className="App">
    <h3>Zaiserve - Role Based Permission Functionality</h3>
      <LoginPage />    
    </div>
    </Provider>
  );
}

export default App;
