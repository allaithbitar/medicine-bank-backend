import "reflect-metadata";
import { inject, injectable } from "inversify";
import { FamilyMemberRepo } from "../repos/family-member.repo";
import {
  TAddFamilyMemberDto,
  TFilterFamilyMembersDto,
  TUpdateFamilyMemberDto,
} from "../types/family-member.type";
@injectable()
export class FamilyMemberService {
  constructor(
    @inject(FamilyMemberRepo) private familyMemberRepo: FamilyMemberRepo,
  ) {}

  getFamilyMembers(dto: TFilterFamilyMembersDto) {
    return this.familyMemberRepo.findManyPaginated(dto);
  }

  getFamilyMember(id: string) {
    return this.familyMemberRepo.findById(id);
  }

  async addFamilyMember(dto: TAddFamilyMemberDto) {
    await this.familyMemberRepo.create(dto);
  }

  async updateFamilyMember(dto: TUpdateFamilyMemberDto) {
    await this.familyMemberRepo.update(dto);
  }
}
