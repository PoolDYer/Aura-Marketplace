import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

describe('AppModule', () => {
  it('should compile the main AppModule successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(AppService)).toBeDefined();
    expect(moduleRef.get(AppController)).toBeDefined();
  });
});
