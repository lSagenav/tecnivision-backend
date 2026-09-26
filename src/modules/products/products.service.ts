import { prisma } from "../../config/prisma.js";
import { generateSlug } from "../../utils/slug.js";
import { serializeProductOptions } from "../../utils/product-options.js";
export async function uniqueSlug(name: string, excludeId?: number) { const base=generateSlug(name)||"producto"; let slug=base, i=2; while(await prisma.product.findFirst({where:{slug,...(excludeId?{id:{not:excludeId}}:{})}})){slug=`${base}-${i++}`;} return slug; }
export async function listProducts(filters: { branch?: string; category?: string; search?: string; admin?: boolean }) {
  const products=await prisma.product.findMany({where:{...(filters.admin?{}:{available:true}),...(filters.branch?{branchSlug:filters.branch}:{}),...(filters.category?{category:{slug:filters.category}}:{})},include:{category:true},orderBy:[{featured:"desc"},{createdAt:"desc"}]});
  if(!filters.search) return products; const q=normalize(filters.search); return products.filter(p=>normalize(`${p.name} ${p.description}`).includes(q));
}
function normalize(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es");}
export const getProductBySlug=(slug:string)=>prisma.product.findUnique({where:{slug},include:{category:true}});
export const getProductById=(id:number)=>prisma.product.findUnique({where:{id},include:{category:true}});
export async function createProduct(data:{name:string;description:string;categoryId:number;branchSlug:string;available:boolean;featured:boolean;productOptions?:unknown;imageUrl?:string|null}) { return prisma.product.create({data:{...data,slug:await uniqueSlug(data.name),productOptions:serializeProductOptions(data.productOptions)}}); }
export async function updateProduct(id:number,data:{name:string;description:string;categoryId:number;branchSlug:string;available:boolean;featured:boolean;productOptions?:unknown;imageUrl?:string|null}) { return prisma.product.update({where:{id},data:{...data,slug:await uniqueSlug(data.name,id),productOptions:serializeProductOptions(data.productOptions)}}); }
export async function removeProduct(id:number){ const p=await prisma.product.findUnique({where:{id}}); if(!p)return null; await prisma.$transaction([prisma.orderItem.deleteMany({where:{productId:id}}),prisma.product.delete({where:{id}})]); return p; }
