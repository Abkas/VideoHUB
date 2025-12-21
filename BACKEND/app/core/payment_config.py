"""
Payment Gateway Configuration
Supports Razorpay (India) and Fonepay (Nepal)
"""

from typing import Dict, Any

# Payment Gateway Configuration
PAYMENT_GATEWAYS = {
    "IN": {
        "name": "razorpay",
        "display_name": "Razorpay",
        "currency": "INR",
        "symbol": "₹",
        "supported_methods": ["card", "upi", "netbanking", "wallet"]
    },
    "NP": {
        "name": "fonepay",
        "display_name": "Fonepay",
        "currency": "NPR",
        "symbol": "Rs.",
        "supported_methods": ["qr", "wallet"]
    },
    "default": {
        "name": "paypal",
        "display_name": "PayPal",
        "currency": "USD",
        "symbol": "$",
        "supported_methods": ["paypal"]
    }
}

# Subscription Plans Configuration
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "display_name": "Free",
        "description": "Basic access with ads",
        "features": [
            "480p quality",
            "Ad-supported",
            "Limited watch history (30 days)",
            "No downloads"
        ],
        "price_inr": 0,
        "price_npr": 0,
        "price_usd": 0,
        "max_quality": "480p",
        "concurrent_streams": 1,
        "downloads_per_month": 0,
        "upload_limit_gb": 0,
        "ad_free": False,
        "priority_support": False,
        "is_active": True
    },
    "basic": {
        "name": "Basic",
        "display_name": "Basic",
        "description": "Ad-free with HD quality",
        "features": [
            "720p HD quality",
            "Ad-free experience",
            "Download 5 videos/month",
            "Full watch history",
            "1 concurrent stream"
        ],
        "price_inr": 99,
        "price_npr": 200,
        "price_usd": 1.99,
        "max_quality": "720p",
        "concurrent_streams": 1,
        "downloads_per_month": 5,
        "upload_limit_gb": 5,
        "ad_free": True,
        "priority_support": False,
        "is_active": True
    },
    "premium": {
        "name": "Premium",
        "display_name": "Premium",
        "description": "Full HD with unlimited downloads",
        "features": [
            "1080p Full HD quality",
            "Ad-free experience",
            "Unlimited downloads",
            "2 concurrent streams",
            "Early access to content",
            "Priority support"
        ],
        "price_inr": 299,
        "price_npr": 500,
        "price_usd": 4.99,
        "max_quality": "1080p",
        "concurrent_streams": 2,
        "downloads_per_month": -1,  # Unlimited
        "upload_limit_gb": 20,
        "ad_free": True,
        "priority_support": True,
        "is_active": True
    },
    "premium_plus": {
        "name": "Premium Plus",
        "display_name": "Premium Plus",
        "description": "4K Ultra HD with premium features",
        "features": [
            "4K Ultra HD quality",
            "Ad-free experience",
            "Unlimited downloads",
            "4 concurrent streams",
            "Exclusive premium content",
            "No watermarks",
            "Priority support"
        ],
        "price_inr": 499,
        "price_npr": 800,
        "price_usd": 7.99,
        "max_quality": "4k",
        "concurrent_streams": 4,
        "downloads_per_month": -1,
        "upload_limit_gb": 50,
        "ad_free": True,
        "priority_support": True,
        "is_active": True
    }
}

# Annual Discount (percentage)
ANNUAL_DISCOUNT = 25  # 25% off for annual subscriptions

# Trial Period Configuration
TRIAL_PERIOD_DAYS = 7

# Grace Period Configuration
GRACE_PERIOD_DAYS = 3


def get_plan_price(plan_name: str, currency: str, billing_cycle: str = "monthly") -> float:
    """Get price for a plan based on currency and billing cycle"""
    if plan_name not in SUBSCRIPTION_PLANS:
        return 0.0
    
    plan = SUBSCRIPTION_PLANS[plan_name]
    
    # Get base price
    if currency == "INR":
        price = plan["price_inr"]
    elif currency == "NPR":
        price = plan["price_npr"]
    else:
        price = plan["price_usd"]
    
    # Apply annual discount
    if billing_cycle == "yearly":
        yearly_price = price * 12
        discount = yearly_price * (ANNUAL_DISCOUNT / 100)
        return yearly_price - discount
    
    return price


def get_payment_gateway(country_code: str) -> Dict[str, Any]:
    """Get payment gateway configuration for a country"""
    return PAYMENT_GATEWAYS.get(country_code, PAYMENT_GATEWAYS["default"])


def get_plan_details(plan_name: str) -> Dict[str, Any]:
    """Get subscription plan details"""
    return SUBSCRIPTION_PLANS.get(plan_name, SUBSCRIPTION_PLANS["free"])
