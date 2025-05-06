import { Company } from '../../../../src/Domain/Entities/Company';

describe('Company Entity', () => {
    let company: Company;

    beforeEach(() => {
        company = new Company();
    });

    it('should have default values when instantiated', () => {
        expect(company.getIsActive()).toBe(true);
        expect(company.getCreatedAt()).toBeInstanceOf(Date);
        expect(company.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should format CUIT correctly', () => {
        company.setCuit('30716595549');
        expect(company.getCuit()).toBe('30-71659554-9');

        company.setCuit('30-71659554-9');
        expect(company.getCuit()).toBe('30-71659554-9');
    });

    it('should trim business name', () => {
        company.setBusinessName('  Test Company  ');
        expect(company.getBusinessName()).toBe('Test Company');
    });

    it('should handle optional fields', () => {
        expect(company.getAddress()).toBeUndefined();
        expect(company.getContactEmail()).toBeUndefined();
        expect(company.getContactPhone()).toBeUndefined();
        expect(company.getDeletedAt()).toBeUndefined();

        company.setAddress('Test Address');
        company.setContactEmail('test@example.com');
        company.setContactPhone('1234567890');

        expect(company.getAddress()).toBe('Test Address');
        expect(company.getContactEmail()).toBe('test@example.com');
        expect(company.getContactPhone()).toBe('1234567890');
    });

    it('should set and get ID and UUID correctly', () => {
        company.setId(1);
        company.setUuid('test-uuid-1234');

        expect(company.getId()).toBe(1);
        expect(company.getUuid()).toBe('test-uuid-1234');
    });

    it('should handle adhesion date correctly', () => {
        const date = new Date('2025-04-15T10:30:00Z');
        company.setAdhesionDate(date);

        expect(company.getAdhesionDate()).toEqual(date);
    });
});