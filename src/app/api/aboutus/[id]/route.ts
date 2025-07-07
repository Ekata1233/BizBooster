import { NextRequest, NextResponse } from "next/server";

// import { v4 as uuidv4 } from "uuid";
import AboutUs from "@/models/AboutUs";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function PUT(req:NextRequest) {
    
    await connectToDatabase()

    try{
         const {content} = await req.json()
          if(!content) {
                    return NextResponse.json(
                     {success:false, message: "Abouts us section content is required"},
                     {status:400, headers:corsHeaders}
                 )
                 }
                 const aboutusEntry = await AboutUs.findOne()

                 if(!aboutusEntry){
                      return NextResponse.json(
                     {success:false, message: "Abouts Us content not found to update"},
                     {status:404, headers:corsHeaders}
                 )
                 }

                 aboutusEntry.content = content
                 await aboutusEntry.save()

                 return NextResponse.json(
                        {success:true, data: aboutusEntry},
                        {status:200, headers:corsHeaders}
                       );
    }
     catch (error: unknown) {
             const message = error instanceof Error ? error.message : "Unknown error";
             return NextResponse.json(
               { success: false, message },
               { status: 400, headers: corsHeaders }
             );
           }
}


export async function DELETE() {

    await connectToDatabase()

    try{
     const result = await AboutUs.deleteOne({})
          if(result.deletedCount === 0){
            return NextResponse.json(
                     {success:false, message: "Abouts Us content not found to delete"},
                     {status:404, headers:corsHeaders}
                 )
          }
          
            return NextResponse.json(
                     {success:true, message: "Abouts Us content deleted successfully"},
                     {status:200, headers:corsHeaders}
                 )
    }
      catch (error: unknown) {
             const message = error instanceof Error ? error.message : "Unknown error";
             return NextResponse.json(
               { success: false, message },
               { status: 400, headers: corsHeaders }
             );
           }
}