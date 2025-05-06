import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/Infrastructure/Modules/AppModule';
import { DataSeedService } from '../../src/Application/Services/DataSeedService';

describe('Challenge Endpoints (e2e)', () => {
    let app: INestApplication;
    let dataSeedService: DataSeedService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        app.setGlobalPrefix('api/v1/backend-challenge');
        dataSeedService = moduleFixture.get<DataSeedService>(DataSeedService);
        await dataSeedService['_seedData']();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /companies/adhering/last-month', () => {
        it('should return companies that adhered last month', () => {
            return request(app.getHttpServer())
                .get('/api/v1/backend-challenge/companies/adhering/last-month')
                .expect(200)
                .expect(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.result).toBeInstanceOf(Array);
                    expect(res.body.result.length).toBeGreaterThan(0);

                    const company = res.body.result[0];
                    expect(company.uuid).toBeDefined();
                    expect(company.cuit).toBeDefined();
                    expect(company.businessName).toBeDefined();
                    expect(company.adhesionDate).toBeDefined();
                });
        });
    });

    describe('GET /transfers/companies/last-month', () => {
        it('should return companies with transfers last month', () => {
            return request(app.getHttpServer())
                .get('/api/v1/backend-challenge/transfers/companies/last-month')
                .expect(200)
                .expect(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.result).toBeInstanceOf(Array);
                    expect(res.body.result.length).toBeGreaterThan(0);

                    const company = res.body.result[0];
                    expect(company.uuid).toBeDefined();
                    expect(company.cuit).toBeDefined();
                    expect(company.businessName).toBeDefined();
                });
        });
    });

    describe('POST /companies', () => {
        it('should create a new company', () => {
            const newCompany = {
                cuit: '30-71987654-3',
                businessName: 'Test Company E2E',
                address: 'Test Address 123',
                contactEmail: 'test@example.com',
                contactPhone: '1234567890'
            };

            return request(app.getHttpServer())
                .post('/api/v1/backend-challenge/companies')
                .send(newCompany)
                .expect(201)
                .expect(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.result).toBeDefined();
                    expect(res.body.result.message).toBe('Company created successfully');
                });
        });

        it('should validate required fields when creating a company', () => {
            const invalidCompany = {
                address: 'Test Address 123',
                contactEmail: 'test@example.com',
                contactPhone: '1234567890'
            };

            return request(app.getHttpServer())
                .post('/api/v1/backend-challenge/companies')
                .send(invalidCompany)
                .expect(400)
                .expect(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.message).toBeInstanceOf(Array);
                    expect((res.body.message as string[]).some((msg: string) => msg.includes('cuit'))).toBeTruthy();
                    expect((res.body.message as string[]).some((msg: string) => msg.includes('businessName'))).toBeTruthy();
                });
        });
    });
});