import { BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('company')
export class CompanyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ nullable: false, type: 'uuid', name: 'uuid' })
    uuid: string;

    @Column({ nullable: false, length: 50 })
    cuit: string;

    @Column({ nullable: false, length: 50, name: 'business_name' })
    businessName: string;

    @Column({ nullable: false, type: 'timestamp', name: 'adhesion_date' })
    adhesionDate: Date;

    @Column({ nullable: true, length: 255, name: 'address' })
    address: string;

    @Column({ nullable: true, length: 100, name: 'contact_email' })
    contactEmail: string;

    @Column({ nullable: true, length: 50, name: 'contact_phone' })
    contactPhone: string;

    @Column({ nullable: true, type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: true, name: 'deleted_at', type: 'timestamp' })
    deletedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    validateAndFormatData() {
        if (this.cuit && !this.cuit.includes('-')) {
            this.cuit = `${this.cuit.substring(0, 2)}-${this.cuit.substring(2, 10)}-${this.cuit.substring(10, 11)}`;
        }
        if (this.businessName) {
            this.businessName = this.businessName.trim();
        }
    }
}