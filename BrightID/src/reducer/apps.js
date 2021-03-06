// @flow

import {
  SET_APPS,
  ADD_APP,
  REMOVE_APP,
  RESET_STORE,
  UPDATE_APP,
} from '@/actions';
import { find, propEq } from 'ramda';

const initialState = {
  apps: [],
};

export const reducer = (state: AppsState = initialState, action: action) => {
  switch (action.type) {
    case SET_APPS: {
      return {
        ...state,
        apps: action.apps,
      };
    }
    case ADD_APP: {
      const removeExisting = ({ name }) => name !== action.app.name;
      const apps: AppInfo[] = state.apps
        .filter(removeExisting)
        .concat(action.app);
      return {
        ...state,
        apps,
      };
    }
    case UPDATE_APP: {
      let apps;
      const updatedApp = find(propEq('name', action.op.context))(state.apps);
      if (updatedApp !== undefined) {
        if (action.state === 'applied') {
          updatedApp.state = 'applied';
          updatedApp.contextId = action.op.contextId;
          updatedApp.linked = true;
        } else if (updatedApp.linked && action.result.includes('duplicate')) {
          updatedApp.state = 'applied';
        } else {
          updatedApp.state = 'failed';
        }
        const removeExisting = ({ name }) => name !== action.op.context;
        apps = state.apps.filter(removeExisting).concat(updatedApp);
      } else {
        apps = state.apps;
      }
      return {
        ...state,
        apps,
      };
    }
    case REMOVE_APP: {
      const apps: AppInfo[] = state.apps.filter(
        (app) => app.name !== action.name,
      );
      return {
        ...state,
        apps,
      };
    }
    case RESET_STORE: {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
