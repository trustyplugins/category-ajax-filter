#!/usr/bin/env python3
"""Build assets/blueprints/blueprint.json from the PHP source files."""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
CPT = (HERE / "caf-playground-demo-cpt.php").read_text(encoding="utf-8")
SEED_TEMPLATE = (HERE / "caf-playground-seed.php").read_text(encoding="utf-8")

if "{{CAF_PREVIEW_MU_PLUGIN}}" not in SEED_TEMPLATE:
    raise SystemExit("Seed template is missing {{CAF_PREVIEW_MU_PLUGIN}} placeholder.")

seed = SEED_TEMPLATE.replace("{{CAF_PREVIEW_MU_PLUGIN}}", CPT.strip())

blueprint = {
    "landingPage": "/wp-admin/edit.php?post_type=caf_posts&builder=1",
    "preferredVersions": {
        "php": "8.0",
        "wp": "latest",
    },
    "phpExtensionBundles": ["kitchen-sink"],
    "features": {"networking": True},
    "steps": [
        {
            "step": "installPlugin",
            "options": {"activate": True},
            "pluginData": {
                "resource": "wordpress.org/plugins",
                "slug": "category-ajax-filter",
            },
        },
        {
            "step": "installPlugin",
            "options": {"activate": True},
            "pluginData": {
                "resource": "wordpress.org/plugins",
                "slug": "woocommerce",
            },
        },
        {
            "step": "login",
            "username": "admin",
            "password": "password",
        },
        {
            "step": "runPHP",
            "code": seed,
        },
    ],
    "login": True,
}

out = HERE / "blueprint.json"
out.write_text(json.dumps(blueprint, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {out} ({out.stat().st_size} bytes)")
