// TransitionWrapper.test.ts

/**
 * @jest-environment jsdom
 *
 * This tells Jest to use the jsdom environment for this test file,
 * which simulates a browser environment suitable for testing code
 * that interacts with the DOM or libraries like Konva.
 */

import Konva from 'konva';
import TransitionWrapper from './TransitionWrapper';
import NodeWrapper from './NodeWrapper';
import TokenWrapper from './TokenWrapper';
import StateManager from './StateManager';
import { Tool } from './Tool';
/*
// because Konva interacts with the DOM we need to mock it
// to prevent errors when running tests in a Node.js environment
jest.mock('konva', () => {
  return {
    // mocking the Arrow class used in TransitionWrapper.
    Arrow: jest.fn(() => ({
      points: jest.fn(),
      tension: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      on: jest.fn(),
    })),
    // mocking the Text class used for labels.
    Text: jest.fn(() => ({
      text: jest.fn(),
      position: jest.fn(),
      fill: jest.fn(),
    })),
    // mocking the Circle class used for debugging or label positioning.
    Circle: jest.fn(() => ({
      position: jest.fn(),
    })),
    // mocking the Group class used to group Konva objects.
    Group: jest.fn(() => ({
      add: jest.fn(),
      on: jest.fn(),
    })),
    // providing a mock for the Node class "base class in Konva"
    Node: class {},
  };
});

describe('TransitionWrapper Tests', () => {
  let sourceNode: NodeWrapper;
  let destNode: NodeWrapper;
  let tokenA: TokenWrapper;
  let transition: TransitionWrapper;
  let transitions: TransitionWrapper[] = [];

  beforeEach(() => {
    // creating mock source and destination nodes
    sourceNode = {
      id: 'source-node',
      nodeGroup: {
        position: jest.fn().mockReturnValue({ x: 100, y: 100 }),
        on: jest.fn(),
      },
    } as unknown as NodeWrapper;

    destNode = {
      id: 'dest-node',
      nodeGroup: {
        position: jest.fn().mockReturnValue({ x: 200, y: 200 }),
        on: jest.fn(),
      },
    } as unknown as NodeWrapper;

    
    tokenA = new TokenWrapper('a'); // token used in tests.
    
    transitions = []; // reseting the transitions array before each test

    // mocking StateManager's static methods and properties.

    // mocking the currentTool getter to return Tool.Select.
    jest.spyOn(StateManager, 'currentTool', 'get').mockReturnValue(Tool.Select);

    // mocking methods for selecting and deselecting objects.
    jest.spyOn(StateManager, 'deselectAllObjects').mockImplementation(jest.fn());
    jest.spyOn(StateManager, 'selectObject').mockImplementation(jest.fn());

    // mocking the colorScheme property to provide necessary colors
    jest.spyOn(StateManager, 'colorScheme', 'get').mockReturnValue({
      tentativeTransitionArrowColor: '#FF00FF',
      selectedNodeStrokeColor: '#0000FF',
      nodeFill: '#FFFFFF',
      nodeStrokeColor: '#000000',
      nodeAcceptStrokeColor: '#00FF00',
      nodeLabelColor: '#000000',
      newConnectionGlowColor: '#FFFF00',
      newConnectionShadowOpacity: 0.5,
      newConnectionShadowBlur: 10,
      nodeDragDropShadowColor: '#000000',
      nodeDragDropShadowOpacity: 0.5,
      nodeDragDropShadowBlur: 10,
      errorNodeFillColor: '#FFCCCC',
      errorNodeStrokeColor: '#FF0000',
      errorIconFillColor: '#FF0000',
      errorIconTextColor: '#FFFFFF',
      gridColor: '#CCCCCC',
      transitionArrowColor: '#000000',
      transitionSelectedArrowColor: '#FF0000',
      transitionLabelColor: '#000000',
    });

    // mocking the transitions getter to return our local transitions array
    jest.spyOn(StateManager, 'transitions', 'get').mockImplementation(() => transitions);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Creating a transition sets up the arrow object correctly', () => {
    // creating a new TransitionWrapper instance
    transition = new TransitionWrapper(sourceNode, destNode);

    // Check that the Konva.Arrow constructor was called with the correct parameters.
    expect(Konva.Arrow).toHaveBeenCalledWith({
      x: 0,
      y: 0,
      points: [0, 0, 0, 0],
      stroke: StateManager.colorScheme.transitionArrowColor,
      fill: StateManager.colorScheme.transitionArrowColor,
      strokeWidth: 5,
      lineJoin: 'round',
      pointerLength: 10,
      pointerWidth: 10,
    });
  });

  test('Adding a token updates the label correctly', () => {
    transition = new TransitionWrapper(sourceNode, destNode);

    // Add a token to the transition.
    transition.addToken(tokenA);

    // Access the private labelObject to verify its state.
    const labelObject = transition['labelObject'];

    // Verify that the label's text was updated to include the token's symbol.
    expect(labelObject.text).toHaveBeenCalledWith('a');
  });

  test('Selecting and deselecting the transition changes its color', () => {
    transition = new TransitionWrapper(sourceNode, destNode);

    // selecting the transition
    transition.select();
    // Access the private arrowObject to verify its state.
    const arrowObject = transition['arrowObject'];

    // verifying that the arrow's fill and stroke colors were updated to the selected color
    expect(arrowObject.fill).toHaveBeenCalledWith(StateManager.colorScheme.transitionSelectedArrowColor);
    expect(arrowObject.stroke).toHaveBeenCalledWith(StateManager.colorScheme.transitionSelectedArrowColor);

    transition.deselect(); // delesecting the transition
    // verifying that the arrow's fill and stroke colors were reset to the default color
    expect(arrowObject.fill).toHaveBeenCalledWith(StateManager.colorScheme.transitionArrowColor);
    expect(arrowObject.stroke).toHaveBeenCalledWith(StateManager.colorScheme.transitionArrowColor);
  });

  test('Transition updates points when source or destination node moves', () => {
    transition = new TransitionWrapper(sourceNode, destNode);

    // simulating movement of the source and destination nodes
    sourceNode.nodeGroup.position = jest.fn().mockReturnValue({ x: 150, y: 150 });
    destNode.nodeGroup.position = jest.fn().mockReturnValue({ x: 250, y: 250 });

    // triggering the transition to update its points based on the new node positions
    transition.updatePoints();

    const arrowObject = transition['arrowObject']; // accessing the private arrowObject


    expect(arrowObject.points).toHaveBeenCalled();  // verifying that the arrow's points method was called to update its path

  });

  test('Transition handles self-loop correctly', () => {
    // creating a TransitionWrapper where the source and destination nodes are the same.
    transition = new TransitionWrapper(sourceNode, sourceNode);

    // spying on the private method handleSameSourceAndDest to verify it's called.
    const handleSameSourceAndDestSpy = jest.spyOn(transition as any, 'handleSameSourceAndDest');

    transition.updatePoints();    // triggering the updatePoints method which should call handleSameSourceAndDest for self-loops
    expect(handleSameSourceAndDestSpy).toHaveBeenCalled();  // verifying that handleSameSourceAndDest was called
  });

  test('Transition handles multiple transitions between same nodes (curved vs straight)', () => {
    // creating the first transition between the source and destination nodes
    const firstTransition = new TransitionWrapper(sourceNode, destNode);
    // adding it to the transitions array to simulate existing transitions
    transitions.push(firstTransition);

    // creating the second transition between the same nodes
    const secondTransition = new TransitionWrapper(sourceNode, destNode);
    transitions.push(secondTransition);

    // verifying that the priority is set to 'curve' for both transitions
    expect(firstTransition.priority).toBe('curve');
    expect(secondTransition.priority).toBe('curve');
  });
});
*/