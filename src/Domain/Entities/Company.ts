export class Company {
    private id: number;
    private uuid: string;
    private cuit: string;
    private businessName: string;
    private adhesionDate: Date;
    private address?: string;
    private contactEmail?: string;
    private contactPhone?: string;
    private isActive: boolean;
    private createdAt: Date;
    private updatedAt: Date;
    private deletedAt?: Date;

    constructor() {
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getUuid(): string {
        return this.uuid;
    }

    public setUuid(uuid: string): void {
        this.uuid = uuid;
    }

    public getCuit(): string {
        return this.cuit;
    }

    public setCuit(cuit: string): void {
        this.cuit = cuit;
        if (this.cuit && !this.cuit.includes('-')) {
            this.cuit = `${this.cuit.substring(0, 2)}-${this.cuit.substring(2, 10)}-${this.cuit.substring(10, 11)}`;
        }
    }

    public getBusinessName(): string {
        return this.businessName;
    }

    public setBusinessName(businessName: string): void {
        this.businessName = businessName?.trim();
    }

    public getAdhesionDate(): Date {
        return this.adhesionDate;
    }

    public setAdhesionDate(adhesionDate: Date): void {
        this.adhesionDate = adhesionDate;
    }

    public getAddress(): string | undefined {
        return this.address;
    }

    public setAddress(address?: string): void {
        this.address = address;
    }

    public getContactEmail(): string | undefined {
        return this.contactEmail;
    }

    public setContactEmail(contactEmail?: string): void {
        this.contactEmail = contactEmail;
    }

    public getContactPhone(): string | undefined {
        return this.contactPhone;
    }

    public setContactPhone(contactPhone?: string): void {
        this.contactPhone = contactPhone;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public setIsActive(isActive: boolean): void {
        this.isActive = isActive;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public setCreatedAt(createdAt: Date): void {
        this.createdAt = createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public setUpdatedAt(updatedAt: Date): void {
        this.updatedAt = updatedAt;
    }

    public getDeletedAt(): Date | undefined {
        return this.deletedAt;
    }

    public setDeletedAt(deletedAt?: Date): void {
        this.deletedAt = deletedAt;
    }
}