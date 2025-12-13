import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
        return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
    }

    // Validate barcode format
    if (!/^\d{8,14}$/.test(barcode)) {
        return NextResponse.json({ error: "Invalid barcode format" }, { status: 400 });
    }

    try {
        const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=code,product_name,brands,categories_tags_en,image_url`;

        console.log("[API] Looking up barcode:", barcode);
        console.log("[API] Fetching from:", apiUrl);

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for mobile

        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'SpendSense/1.0 (https://spendsense.com)',
                'Accept': 'application/json',
            },
        });

        clearTimeout(timeoutId);

        console.log("[API] Response status:", response.status);

        if (!response.ok) {
            console.log("[API] Response not OK:", response.status);
            return NextResponse.json({
                error: `API error: ${response.status}`,
                product: null
            }, { status: response.status });
        }

        const data = await response.json();
        console.log("[API] Response data status:", data.status);
        console.log("[API] Product found:", !!data.product);

        if (data.status !== 1 || !data.product) {
            console.log("[API] Product not found in OpenFoodFacts");
            return NextResponse.json({
                product: null,
                message: "Product not found"
            });
        }

        const product = data.product;

        return NextResponse.json({
            product: {
                barcode,
                name: product.product_name || "Unknown Product",
                brand: product.brands || null,
                category: "food",
                image_url: product.image_url || null,
            },
            source: "openfoodfacts",
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json({
                error: "Request timed out. Please try again.",
                product: null
            }, { status: 408 });
        }

        console.error("OpenFoodFacts API error:", error);
        return NextResponse.json({
            error: "Failed to fetch product data",
            product: null
        }, { status: 500 });
    }
}
