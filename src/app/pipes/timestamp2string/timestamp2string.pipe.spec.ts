import { Timestamp2stringPipe } from './timestamp2string.pipe';

describe('Timestamp2stringPipe', () => {
  it('create an instance', () => {
    const pipe = new Timestamp2stringPipe();
    expect(pipe).toBeTruthy();
  });
});
