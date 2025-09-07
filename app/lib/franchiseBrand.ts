export type FranchiseBrand = {
  id: string;
  name: string;
  logo: string;
  color?: string;
};

const defaultColor = '#334155';

export const FRANCHISE_BRAND: Record<string, FranchiseBrand> = {
  '0001': { id: '0001', name: 'Cardinals', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0001.jpg', color: defaultColor },
  '0002': { id: '0002', name: 'Falcons', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0002.jpg', color: defaultColor },
  '0003': { id: '0003', name: 'Ravens', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0003.jpg', color: defaultColor },
  '0004': { id: '0004', name: 'Bills', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0004.jpg', color: defaultColor },
  '0005': { id: '0005', name: 'Panthers', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0005.jpg', color: defaultColor },
  '0006': { id: '0006', name: 'Bears', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2022/61663_franchise_icon0006.jpg', color: defaultColor },
  '0007': { id: '0007', name: 'Bengals', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0007.jpg', color: defaultColor },
  '0008': { id: '0008', name: 'Browns', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2022/61663_franchise_icon0008.jpg', color: defaultColor },
  '0009': { id: '0009', name: 'Cowboys', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0009.jpg', color: defaultColor },
  '0010': { id: '0010', name: 'Broncos', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0010.jpg', color: defaultColor },
  '0011': { id: '0011', name: 'Lions', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0011.jpg', color: defaultColor },
  '0012': { id: '0012', name: 'Packers', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0012.jpg', color: defaultColor },
  '0013': { id: '0013', name: 'Texans', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0013.jpg', color: defaultColor },
  '0014': { id: '0014', name: 'Colts', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0014.jpg', color: defaultColor },
  '0015': { id: '0015', name: 'Jaguars', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0015.jpg', color: defaultColor },
  '0016': { id: '0016', name: 'Chargers', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2022/61663_franchise_icon0016.jpg', color: defaultColor },
  '0017': { id: '0017', name: 'Chiefs', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0017.jpg', color: defaultColor },
  '0018': { id: '0018', name: 'Rams', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0018.jpg', color: defaultColor },
  '0019': { id: '0019', name: 'Dolphins', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0019.jpg', color: defaultColor },
  '0020': { id: '0020', name: 'Vikings', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0020.jpg', color: defaultColor },
  '0021': { id: '0021', name: 'Patriots', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0021.jpg', color: defaultColor },
  '0022': { id: '0022', name: 'Saints', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0022.jpg', color: defaultColor },
  '0023': { id: '0023', name: 'Giants', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0023.jpg', color: defaultColor },
  '0024': { id: '0024', name: 'Jets', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2022/61663_franchise_icon0024.jpg', color: defaultColor },
  '0025': { id: '0025', name: 'Raiders', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0025.jpg', color: defaultColor },
  '0026': { id: '0026', name: 'Eagles', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0026.jpg', color: defaultColor },
  '0027': { id: '0027', name: 'Steelers', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0027.jpg', color: defaultColor },
  '0028': { id: '0028', name: '49ers', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0028.jpg', color: defaultColor },
  '0029': { id: '0029', name: 'Seahawks', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2024/61663_franchise_icon0029.jpg', color: defaultColor },
  '0030': { id: '0030', name: 'Buccaneers', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2020/61663_franchise_icon0030.jpg', color: defaultColor },
  '0031': { id: '0031', name: 'Titans', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2022/61663_franchise_icon0031.jpg', color: defaultColor },
  '0032': { id: '0032', name: 'Commanders', logo: 'https://www43.myfantasyleague.com/fflnetdynamic2023/61663_franchise_icon0032.jpg', color: defaultColor },
};
