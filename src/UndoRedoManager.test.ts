// UndoRedoManager.test.ts

/**
 * @jest-environment node
 *
 */



import UndoRedoManager, { Action, ActionData } from './UndoRedoManager';



describe('UndoRedoManager Tests', () => {
  beforeEach(() => {
    (UndoRedoManager as any)._stack = [];
    (UndoRedoManager as any)._stackLocation = -1;
    (UndoRedoManager as any)._listeners = new Set();
  });



  test('Push action and verify forward function is called', () => {
    // creating mock functions for forward and backward actions.
    // jest.fn() creates a mock function that we are using to test whether it was called
    const forwardMock = jest.fn();
    const backwardMock = jest.fn();

    // this creates an instance of ActionData to pass to our Action
    const actionData = new ActionData();

    // new Action with the mocks and action data
    const action = new Action(
      'Test Action',               
      'Testing forward function',  
      forwardMock,                 
      backwardMock,               
      actionData                   
    );

    // pushing the action onto the UndoRedoManager stack
    UndoRedoManager.pushAction(action);

    // verifyingthat the forward function was called with the correct data
    expect(forwardMock).toHaveBeenCalledWith(actionData);

    // verifying that the action is added to the stack
    expect(UndoRedoManager.getStack()).toHaveLength(1);

    // verifying that the stack location pointer is updated to point to the new action
    expect(UndoRedoManager.getStackLocation()).toBe(0);
  });

  test('Undo action and verify backward function is called', () => {
    const forwardMock = jest.fn();
    const backwardMock = jest.fn();
    const actionData = new ActionData();
    const action = new Action(
      'Test Action',                
      'Testing backward function',  
      forwardMock,                 
      backwardMock,                
      actionData                    
    );

    UndoRedoManager.pushAction(action);
    UndoRedoManager.undo();

    expect(backwardMock).toHaveBeenCalledWith(actionData);

    expect(UndoRedoManager.getStackLocation()).toBe(-1);
  });

  test('Redo action and verify forward function is called again', () => {
    const forwardMock = jest.fn();
    const backwardMock = jest.fn();

    const actionData = new ActionData();

    const action = new Action(
      'Test Action',             
      'Testing redo function',   
      forwardMock,               
      backwardMock,              
      actionData                
    );

    UndoRedoManager.pushAction(action);

    UndoRedoManager.undo();

    UndoRedoManager.redo();

    // verifying that the forward function was called twice:
    // -when the action was initially pushed
    // -when the redo was performed
    expect(forwardMock).toHaveBeenCalledTimes(2);

    // verifying that the forward function was called with the correct data during redo
    expect(forwardMock).toHaveBeenCalledWith(actionData);

    // verifying that the stack location pointer is back at the actions position
    expect(UndoRedoManager.getStackLocation()).toBe(0);
  });
});
