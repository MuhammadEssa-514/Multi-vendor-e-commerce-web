
"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function SellerLandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
                    Become a Seller on DarazClone
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Start your business today and reach millions of customers.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500" />
                            <p className="ml-3 text-sm text-gray-700">Access to millions of customers</p>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500" />
                            <p className="ml-3 text-sm text-gray-700">Easy product listing and order management</p>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500" />
                            <p className="ml-3 text-sm text-gray-700">Fast and reliable payments</p>
                        </div>

                        <div className="mt-6">
                            <Link href="/auth/register?role=seller" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Register as a Seller <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>

                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already a seller?</span>
                            </div>
                        </div>

                        <div>
                            <Link href="/auth/signin" className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Login to Seller Center
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
