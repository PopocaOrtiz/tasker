import { TaskerPage } from './app.po';

describe('tasker App', function() {
  let page: TaskerPage;

  beforeEach(() => {
    page = new TaskerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
