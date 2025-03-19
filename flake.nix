{
  description = "A basic flake to with flake-parts";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
    devenv.url = "github:cachix/devenv";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      systems,
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
        inputs.devenv.flakeModule
      ];
      systems = import inputs.systems;

      perSystem =
        {
          config,
          pkgs,
          system,
          ...
        }:
        let
          rustPlatform = pkgs.makeRustPlatform {
            cargo = pkgs.rust-bin.nightly.latest.default;
            rustc = pkgs.rust-bin.nightly.latest.default;
          };

          gleam = rustPlatform.buildRustPackage rec {
            pname = "gleam";
            version = "1.9.0";
            auditable = false;
            doCheck = false;

            nativeBuildInputs = [ pkgs.git ];

            src = pkgs.fetchFromGitHub {
              owner = "gleam-lang";
              repo = pname;
              rev = "v${version}";
              hash = "sha256-+06ZxeBYxpp8zdpxGolBW8FCrCf8vdt1RO2z9jkDGbg=";
            };

            useFetchCargoVendor = true;
            cargoHash = "sha256-RV+AghBBCHjbp+rgQiftlHUPuzigMkvcQHjbs4Lewvs=";
          };

          git-secrets' = pkgs.writeShellApplication {
            name = "git-secrets";
            runtimeInputs = [ pkgs.git-secrets ];
            text = ''
              git secrets --scan
            '';
          };
        in
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [
              inputs.rust-overlay.overlays.default
            ];
            config = { };
          };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
            };

            settings.formatter = { };
          };

          pre-commit = {
            check.enable = true;
            settings = {
              hooks = {
                treefmt.enable = true;
                ripsecrets.enable = true;
                git-secrets = {
                  enable = true;
                  name = "git-secrets";
                  entry = "${git-secrets'}/bin/git-secrets";
                  language = "system";
                  types = [ "text" ];
                };
              };
            };
          };

          devenv.shells.default = {
            packages = with pkgs; [
              esbuild

              nil
            ];

            languages = {
              gleam = {
                enable = true;
                package = gleam;
              };
              erlang = {
                enable = true;
              };
              javascript = {
                enable = true;
                bun.enable = true;
              };
              deno = {
                enable = true;
              };
            };

            enterShell = '''';
          };
        };
    };
}
