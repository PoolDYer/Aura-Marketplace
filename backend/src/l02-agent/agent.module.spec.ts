import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from './agent.module';
import { AgentService } from './agent.service';
import { AgentController } from '../l01-presentation/agent/agent.controller';
import { AuthModule } from '../l03-application/auth/auth.module';

describe('AgentModule', () => {
  it('should compile AgentModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        AgentModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(AgentService)).toBeDefined();
    expect(moduleRef.get(AgentController)).toBeDefined();
  });
});
