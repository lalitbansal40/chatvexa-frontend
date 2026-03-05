import { combineReducers } from 'redux';

// project import
import menu from './menu';
import snackbar from './snackbar';
import chat from './chat';   // 👈 ADD THIS

const reducers = combineReducers({
  menu,
  snackbar,
  chat          // 👈 ADD THIS
});

export default reducers;