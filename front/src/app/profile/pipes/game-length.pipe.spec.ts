import { GameLengthPipe } from './game-length.pipe';

describe('GameLengthPipe', () => {
  it('create an instance', () => {
    const pipe = new GameLengthPipe();
    expect(pipe).toBeTruthy();
  });
});
