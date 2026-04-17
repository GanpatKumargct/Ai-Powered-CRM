import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  hcp_name: '',
  interaction_type: 'Meeting',
  date: '',
  time: '',
  attendees: '',
  topics_discussed: '',
  materials_shared: '',
  samples_distributed: '',
  sentiment: '',
  outcomes: '',
  follow_up_actions: '',
  history: [],
  isHistoryOpen: false,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updateForm: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetForm: () => ({ ...initialState, history: [], isHistoryOpen: false }),
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    toggleHistory: (state) => {
      state.isHistoryOpen = !state.isHistoryOpen;
    }
  },
});

export const { updateForm, updateFormField, resetForm, setHistory, toggleHistory } = formSlice.actions;
export default formSlice.reducer;
