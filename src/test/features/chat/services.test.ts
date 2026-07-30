import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConnection = vi.hoisted(() => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  invoke: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
  onclose: vi.fn(),
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  state: 'Connected',
}));

vi.mock('@microsoft/signalr', async () => {
  const actual = await vi.importActual<typeof import('@microsoft/signalr')>('@microsoft/signalr');
  return {
    ...actual,
    HubConnectionBuilder: vi.fn().mockImplementation(() => ({
      withUrl: vi.fn().mockReturnThis(),
      withAutomaticReconnect: vi.fn().mockReturnThis(),
      build: vi.fn(() => mockConnection),
    })),
  };
});

// chatService is a module-level singleton, so each test resets the module
// registry and re-imports it fresh to avoid state (and mock-call history)
// leaking between tests.
describe('chatService project realtime (Task 242)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.state = 'Connected';
    vi.resetModules();
  });

  it('joinProject invokes the JoinProject hub method', async () => {
    const { chatService } = await import('../../../features/chat/services');

    await chatService.joinProject('project-9');

    expect(mockConnection.invoke).toHaveBeenCalledWith('JoinProject', 'project-9');
  });

  it('leaveProject invokes the LeaveProject hub method', async () => {
    const { chatService } = await import('../../../features/chat/services');

    await chatService.joinProject('project-9');
    await chatService.leaveProject('project-9');

    expect(mockConnection.invoke).toHaveBeenCalledWith('LeaveProject', 'project-9');
  });

  it('dispatches MilestoneUpdated events to onMilestoneUpdate subscribers', async () => {
    const { chatService } = await import('../../../features/chat/services');
    const callback = vi.fn();
    const unsubscribe = chatService.onMilestoneUpdate(callback);

    await chatService.connect();

    const registeredHandler = mockConnection.on.mock.calls.find(([event]) => event === 'MilestoneUpdated')?.[1];
    expect(registeredHandler).toBeDefined();

    registeredHandler!({ projectId: 'project-9', milestoneId: 'ms-1' });
    expect(callback).toHaveBeenCalledWith({ projectId: 'project-9', milestoneId: 'ms-1' });

    unsubscribe();
    registeredHandler!({ projectId: 'project-9', milestoneId: 'ms-2' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('re-joins every active project group on reconnect', async () => {
    const { chatService } = await import('../../../features/chat/services');

    await chatService.joinProject('project-9');
    mockConnection.invoke.mockClear();

    const reconnectedHandler = mockConnection.onreconnected.mock.calls[0][0] as () => void;
    reconnectedHandler();

    expect(mockConnection.invoke).toHaveBeenCalledWith('JoinProject', 'project-9');
  });

  it('re-joins every active project group when the connection is torn down and started fresh', async () => {
    const { chatService } = await import('../../../features/chat/services');

    await chatService.joinProject('project-9');
    await chatService.resetChatConnection();
    mockConnection.state = 'Disconnected';
    mockConnection.invoke.mockClear();

    await chatService.connect();

    expect(mockConnection.invoke).toHaveBeenCalledWith('JoinProject', 'project-9');
  });

  it('re-attaches DisputeUpdated/MilestoneUpdated listeners on a fresh connection after teardown', async () => {
    const { chatService } = await import('../../../features/chat/services');

    await chatService.connect();
    await chatService.resetChatConnection();
    mockConnection.state = 'Disconnected';
    mockConnection.on.mockClear();

    await chatService.connect();

    expect(mockConnection.on).toHaveBeenCalledWith('DisputeUpdated', expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith('MilestoneUpdated', expect.any(Function));
  });

  it('dispatches DisputeUpdated events to onDisputeUpdate subscribers', async () => {
    const { chatService } = await import('../../../features/chat/services');
    const callback = vi.fn();
    const unsubscribe = chatService.onDisputeUpdate(callback);

    await chatService.connect();

    const registeredHandler = mockConnection.on.mock.calls.find(([event]) => event === 'DisputeUpdated')?.[1];
    expect(registeredHandler).toBeDefined();

    registeredHandler!({ projectId: 'project-9', disputeId: 'dispute-1' });
    expect(callback).toHaveBeenCalledWith({ projectId: 'project-9', disputeId: 'dispute-1' });

    unsubscribe();
    registeredHandler!({ projectId: 'project-9', disputeId: 'dispute-2' });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
