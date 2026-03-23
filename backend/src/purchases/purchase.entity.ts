import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ProductVariant } from '../products/product-variant.entity';
import { User } from '../users/user.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  variantId: number;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'date' })
  purchaseDate: string;

  @Column({ length: 255, nullable: true })
  note: string;

  @Column({ nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
