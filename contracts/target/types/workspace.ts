/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/workspace.json`.
 */
export type Workspace = {
  "address": "4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp",
  "metadata": {
    "name": "workspace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "completeHarvest",
      "discriminator": [
        205,
        33,
        10,
        123,
        226,
        164,
        240,
        142
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initializeCampaign",
      "discriminator": [
        169,
        88,
        7,
        6,
        9,
        165,
        65,
        132
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "farmer"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "farmer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "string"
        },
        {
          "name": "cropType",
          "type": "string"
        },
        {
          "name": "fundingGoal",
          "type": "u64"
        },
        {
          "name": "profitSplitBps",
          "type": "u16"
        },
        {
          "name": "seasonStart",
          "type": "i64"
        },
        {
          "name": "seasonEnd",
          "type": "i64"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "insuranceDeductionBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeMilestone",
      "discriminator": [
        142,
        73,
        5,
        208,
        226,
        196,
        205,
        113
      ],
      "accounts": [
        {
          "name": "milestone",
          "writable": true
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "farmer",
          "writable": true,
          "signer": true,
          "relations": [
            "campaign"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "releaseBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "invest",
      "discriminator": [
        13,
        245,
        180,
        103,
        254,
        182,
        121,
        4
      ],
      "accounts": [
        {
          "name": "investment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  118,
                  101,
                  115,
                  116,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "campaign"
              },
              {
                "kind": "account",
                "path": "investor"
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "investor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "triggerLossSharing",
      "discriminator": [
        17,
        90,
        198,
        137,
        228,
        253,
        239,
        3
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "farmer",
          "writable": true,
          "relations": [
            "campaign"
          ]
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "verifyMilestone",
      "discriminator": [
        33,
        124,
        38,
        194,
        150,
        153,
        90,
        227
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "milestone",
          "writable": true
        },
        {
          "name": "farmer",
          "writable": true,
          "relations": [
            "campaign"
          ]
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "aiProofHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdrawInvestment",
      "discriminator": [
        157,
        158,
        101,
        11,
        240,
        193,
        192,
        92
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "investment",
          "writable": true
        },
        {
          "name": "investor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "farmCampaign",
      "discriminator": [
        33,
        76,
        105,
        246,
        121,
        91,
        87,
        62
      ]
    },
    {
      "name": "investment",
      "discriminator": [
        175,
        134,
        9,
        175,
        115,
        153,
        39,
        28
      ]
    },
    {
      "name": "milestone",
      "discriminator": [
        38,
        210,
        239,
        177,
        85,
        184,
        10,
        44
      ]
    },
    {
      "name": "programConfig",
      "discriminator": [
        196,
        210,
        90,
        231,
        144,
        149,
        140,
        63
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Math overflow occurred"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6003,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6004,
      "name": "invalidParameter",
      "msg": "Invalid parameter"
    },
    {
      "code": 6005,
      "name": "campaignNotActive",
      "msg": "Campaign is not active"
    },
    {
      "code": 6006,
      "name": "alreadyVerified",
      "msg": "Milestone already verified"
    },
    {
      "code": 6007,
      "name": "milestonesIncomplete",
      "msg": "Not all milestones completed"
    },
    {
      "code": 6008,
      "name": "alreadyClaimed",
      "msg": "Investment already claimed"
    },
    {
      "code": 6009,
      "name": "withdrawNotAllowed",
      "msg": "Withdrawal not allowed in current state"
    }
  ],
  "types": [
    {
      "name": "farmCampaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "farmer",
            "type": "pubkey"
          },
          {
            "name": "campaignId",
            "type": "string"
          },
          {
            "name": "cropType",
            "type": "string"
          },
          {
            "name": "fundingGoal",
            "type": "u64"
          },
          {
            "name": "totalRaised",
            "type": "u64"
          },
          {
            "name": "totalReleased",
            "type": "u64"
          },
          {
            "name": "milestoneCount",
            "type": "u8"
          },
          {
            "name": "milestonesCompleted",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "profitSplitBps",
            "type": "u16"
          },
          {
            "name": "seasonStart",
            "type": "i64"
          },
          {
            "name": "seasonEnd",
            "type": "i64"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "name": "investorCount",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "investment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investor",
            "type": "pubkey"
          },
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "milestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "releaseBps",
            "type": "u16"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "verifiedAt",
            "type": "i64"
          },
          {
            "name": "aiProofHash",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "programConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "insuranceDeductionBps",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
