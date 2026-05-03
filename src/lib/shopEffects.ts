import type { ShopItemEffectKey } from '@/types';
import { JP_ASSETS } from '@/features/office/assets';

export const FACILITY_ART_BY_ID: Record<ShopItemEffectKey, string> = {
  snack: JP_ASSETS.snackJar,
  toy: JP_ASSETS.toyBall,
  desk: JP_ASSETS.woodenDesk,
  policy: JP_ASSETS.policyWall,
  lamp: JP_ASSETS.lanternRed,
  sofa: JP_ASSETS.beanBag,
  artwall: JP_ASSETS.pictureFrame,
  coffee: JP_ASSETS.coffeeMachine,
  gym: JP_ASSETS.gymArea,
};

export function describeShopEffect(id: ShopItemEffectKey, lv: number): string[] {
  if (lv <= 0) return ['尚未購置，前往商店購買後生效。'];
  switch (id) {
    case 'desk':
      return [`全 team 案件速度 +${lv}`];
    case 'policy':
      return [`工程 專業 +${lv}`, `工程 速度 +${lv}`];
    case 'artwall':
      return [`美術 專業 +${lv}`, `美術 速度 +${lv}`];
    case 'lamp':
      return [`每日疲勞恢復 +${lv}`];
    case 'coffee':
      return [`客服 專業 +${lv}`, `客服 速度 +${lv}`];
    case 'snack':
      return [`行銷 專業 +${lv}`, `行銷 速度 +${lv}`];
    case 'toy':
      return ['可愛裝飾，目前無數值效果。'];
    case 'gym':
      return [`全員 耐心 +${lv}（疲勞累積變慢）`];
    case 'sofa':
      return [`每日全員疲勞 −${3 + lv * 2}`];
    default:
      return [];
  }
}

export const SHOP_ENGLISH_LABEL: Record<ShopItemEffectKey, string> = {
  desk: 'OFFICE DESK',
  policy: 'POLICY MANUAL',
  artwall: 'ART WALL',
  lamp: 'WARM LAMP',
  coffee: 'COFFEE BAR',
  snack: 'SNACK BOX',
  toy: 'TOY ZONE',
  gym: 'GYM AREA',
  sofa: 'BEAN BAG',
};
